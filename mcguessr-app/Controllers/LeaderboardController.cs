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
        // Jeder Spieler steht nur einmal drin, mit seinem besten Run - schlechtere
        // Runs bleiben gespeichert (für "Gesamt"), tauchen hier aber nicht auf.
        var top = await db.Entries
            .GroupBy(e => e.Name)
            .Select(g => new { Name = g.Key, Score = g.Max(e => e.Score) })
            .OrderByDescending(g => g.Score)
            .Take(10)
            .ToListAsync();

        return Ok(top);
    }

    // Gesamtpunktzahl pro Username über alle Runden/Spiele hinweg, statt nur
    // der einzelnen besten Runde - eigener Endpoint, damit das Frontend
    // zwischen beiden Ansichten umschalten kann.
    [HttpGet("/leaderboard/alltime")]
    public async Task<IActionResult> GetAllTime()
    {
        var top = await db.Entries
            .GroupBy(e => e.Name)
            .Select(g => new { Name = g.Key, Score = g.Sum(e => e.Score) })
            .OrderByDescending(g => g.Score)
            .Take(10)
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

        // Platz unter allen Spielern (nicht nur den Top 10), gemessen am besten
        // Run des Spielers - ein schlechterer Run verschlechtert den Rang nicht.
        var best = await db.Entries.Where(e => e.Name == name).MaxAsync(e => e.Score);
        var rank = await db.Entries
            .GroupBy(e => e.Name)
            .Select(g => g.Max(e => e.Score))
            .CountAsync(max => max > best) + 1;

        return Ok(new { rank });
    }
}
