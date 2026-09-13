namespace McguesSr.Models;

public class LeaderboardEntry
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
