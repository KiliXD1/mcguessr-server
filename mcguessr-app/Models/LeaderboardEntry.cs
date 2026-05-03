using System.ComponentModel.DataAnnotations;

namespace McguesSr.Models;

public class LeaderboardEntry
{
    [Required, MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Score { get; set; }
}
