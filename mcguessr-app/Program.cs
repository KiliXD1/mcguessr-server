using McguesSr;
using McguesSr.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        if (origins is { Length: > 0 })
            policy.WithOrigins(origins);
        else
            policy.AllowAnyOrigin();
        policy.AllowAnyHeader().AllowAnyMethod();
    }));

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonOptions.Default.PropertyNamingPolicy;
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = JsonOptions.Default.PropertyNameCaseInsensitive;
    });

builder.Services.AddSingleton<ILeaderboardService, LeaderboardService>();

var app = builder.Build();

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();

app.Run();
