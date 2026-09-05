var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy =
        System.Text.Json.JsonNamingPolicy.CamelCase);

var app = builder.Build();

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
    app.UseStaticFiles();
}

app.MapControllers();

app.Run();
