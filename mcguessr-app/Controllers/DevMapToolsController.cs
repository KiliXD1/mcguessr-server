using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace McguesSr.Controllers;

public record LocationPointDto(string Image, double X, double Y);

// Nur für den Location-Picker (tools/location-picker.html) - schreibt direkt
// in wwwroot/maps/<mapId>.json, damit man dort nicht mehr von Hand
// kopieren/einfügen muss. Ausschließlich in Development aktiv.
[ApiController]
public partial class DevMapToolsController(IWebHostEnvironment env) : ControllerBase
{
    [GeneratedRegex("^[a-z0-9_-]{1,64}$")]
    private static partial Regex ValidMapId();

    private static readonly JsonSerializerOptions FileJsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [HttpPost("/dev/maps/{mapId}/locations")]
    public async Task<IActionResult> AppendLocation(string mapId, [FromBody] LocationPointDto point)
    {
        if (!env.IsDevelopment()) return NotFound();
        if (!ValidMapId().IsMatch(mapId)) return BadRequest("Invalid mapId");
        if (string.IsNullOrWhiteSpace(point.Image)) return BadRequest("Invalid image");
        if (point.X is < 0 or > 1 || point.Y is < 0 or > 1) return BadRequest("x/y must be between 0 and 1");

        var path = GetLocationsPath(mapId);
        var list = await ReadLocations(path);

        list.Add(point);
        await WriteLocations(path, list);

        return Ok(new { count = list.Count });
    }

    [HttpDelete("/dev/maps/{mapId}/locations/last")]
    public async Task<IActionResult> RemoveLastLocation(string mapId)
    {
        if (!env.IsDevelopment()) return NotFound();
        if (!ValidMapId().IsMatch(mapId)) return BadRequest("Invalid mapId");

        var path = GetLocationsPath(mapId);
        var list = await ReadLocations(path);

        if (list.Count == 0) return Ok(new { count = 0 });

        list.RemoveAt(list.Count - 1);
        await WriteLocations(path, list);

        return Ok(new { count = list.Count });
    }

    private string GetLocationsPath(string mapId) =>
        Path.Combine(env.WebRootPath, "maps", $"{mapId}.json");

    private static async Task<List<LocationPointDto>> ReadLocations(string path)
    {
        if (!System.IO.File.Exists(path)) return [];

        var json = await System.IO.File.ReadAllTextAsync(path);
        if (string.IsNullOrWhiteSpace(json)) return [];

        return JsonSerializer.Deserialize<List<LocationPointDto>>(json, FileJsonOptions) ?? [];
    }

    private static async Task WriteLocations(string path, List<LocationPointDto> list)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await System.IO.File.WriteAllTextAsync(path, JsonSerializer.Serialize(list, FileJsonOptions));
    }
}
