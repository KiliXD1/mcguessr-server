using McguesSr.Models;

namespace McguesSr.Services;

public interface ILeaderboardService
{
    Task<List<LeaderboardEntry>> GetLeaderboardAsync();
    Task AddScoreAsync(string name, int score);
}
