using McguesSr.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy =
        System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddDbContext<LeaderboardDbContext>(o =>
    o.UseSqlite($"Data Source={Path.Combine(builder.Environment.ContentRootPath, "leaderboard.db")}"));

// Gzip/Brotli für html/js/css/json (Bilder sind schon komprimiert).
builder.Services.AddResponseCompression(o => o.EnableForHttps = true);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<LeaderboardDbContext>().Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(a => a.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("An unexpected error occurred.");
    }));
}

app.UseDefaultFiles();

if (app.Environment.IsDevelopment())
{
    // Verhindert, dass der Browser während der Entwicklung veraltetes CSS/JS
    // aus dem Cache zeigt, obwohl die Dateien sich geändert haben.
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers.CacheControl = "no-cache, no-store";
        }
    });
}
else
{
    app.UseResponseCompression();

    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            // Bilder/Audio ändern sich selten und haben (nach der Optimierung)
            // eindeutige Dateinamen - eine Woche cachen, damit wiederkehrende
            // Spieler sie nicht jedes Mal neu laden. Code/Daten (html/js/css/
            // json) werden bei jedem Aufruf per ETag nur geprüft (304), damit
            // Updates sofort ankommen.
            var ext = Path.GetExtension(ctx.File.Name).ToLowerInvariant();
            var longLived = ext is ".webp" or ".png" or ".jpg" or ".jpeg" or ".ico" or ".mp3";
            ctx.Context.Response.Headers.CacheControl =
                longLived ? "public, max-age=604800" : "no-cache";
        }
    });
}

app.MapControllers();

app.Run();
