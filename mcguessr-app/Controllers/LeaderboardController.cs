using Microsoft.AspNetCore.Mvc;
using McguesSr.Models;
using McguesSr.Services;

namespace McguesSr.Controllers;

[ApiController]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _svc;
    public LeaderboardController(ILeaderboardService svc) => _svc = svc;

    [HttpGet("/leaderboard")]
    public async Task<IActionResult> Get()
    {
        var data = await _svc.GetLeaderboardAsync();
        return Ok(data);
    }

    [HttpPost("/leaderboard")]
    public async Task<IActionResult> Post([FromBody] LeaderboardEntry entry)
    {
        if (string.IsNullOrWhiteSpace(entry.Name))
            return BadRequest("Name required");
        await _svc.AddScoreAsync(entry.Name, entry.Score);
        return Ok();
    }
}
