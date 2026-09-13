using McguesSr.Models;
using Microsoft.EntityFrameworkCore;

namespace McguesSr.Data;

public class LeaderboardDbContext(DbContextOptions<LeaderboardDbContext> options) : DbContext(options)
{
    public DbSet<LeaderboardEntry> Entries => Set<LeaderboardEntry>();
}
