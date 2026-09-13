using System.Text.RegularExpressions;
using McguesSr.Data;
using McguesSr.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace McguesSr.Controllers;

public record LeaderboardSubmission(string Name, int Score);

[ApiController]
public partial class LeaderboardController(LeaderboardDbContext db) : ControllerBase
{
    // Muss mit den Spielkonstanten in wwwroot/mcguessr.js (maxRounds, Punkte
    // pro Runde) übereinstimmen - reine Plausibilitätsgrenze, kein Ersatz für
    // eine echte serverseitige Rundenberechnung.
    private const int MaxRounds = 3;
    private const int MaxScorePerRound = 5000;

    [GeneratedRegex("^[A-Za-z0-9_]{1,16}$")]
    private static partial Regex ValidName();

    [HttpGet("/leaderboard")]
    public async Task<IActionResult> Get()
    {
        var top = await db.Entries
            .OrderByDescending(e => e.Score)
            .Take(10)
            .Select(e => new { e.Name, e.Score })
            .ToListAsync();

        return Ok(top);
    }

    [HttpPost("/leaderboard")]
    public async Task<IActionResult> Post([FromBody] LeaderboardSubmission submission)
    {
        var name = submission.Name?.Trim() ?? "";
        if (!ValidName().IsMatch(name))
            return BadRequest("Invalid name");

        if (submission.Score < 0 || submission.Score > MaxRounds * MaxScorePerRound)
            return BadRequest("Invalid score");

        var entry = new LeaderboardEntry { Name = name, Score = submission.Score };
        db.Entries.Add(entry);
        await db.SaveChangesAsync();

        // Platz unter allen Einträgen, nicht nur den Top 10 - damit auch
        // Spieler außerhalb der Top 10 nach der Runde ihren Rang sehen.
        var rank = await db.Entries.CountAsync(e => e.Score > entry.Score) + 1;

        return Ok(new { rank });
    }
}
