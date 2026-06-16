using System.Text.Json;
using McguesSr.Models;

namespace McguesSr.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly string _filePath;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private List<LeaderboardEntry> _cache;

    public LeaderboardService(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "leaderboard.json");
        _cache = LoadFromDisk();
    }

    public Task<List<LeaderboardEntry>> GetLeaderboardAsync()
        => Task.FromResult(_cache.ToList());

    public async Task AddScoreAsync(string name, int score)
    {
        await _lock.WaitAsync();
        try
        {
            _cache.Add(new LeaderboardEntry { Name = name, Score = score });
            _cache = [.. _cache.OrderByDescending(e => e.Score).Take(10)];
            await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(_cache, JsonOptions.Default));
        }
        finally { _lock.Release(); }
    }

    private List<LeaderboardEntry> LoadFromDisk()
    {
        if (!File.Exists(_filePath))
    {
            File.WriteAllText(_filePath, "[]");
            return [];
        }
        try
        {
            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<LeaderboardEntry>>(json, JsonOptions.Default) ?? [];
        }
        catch
        {
            File.WriteAllText(_filePath, "[]");
            return [];
        }
        finally { _lock.Release(); }
    }
}
