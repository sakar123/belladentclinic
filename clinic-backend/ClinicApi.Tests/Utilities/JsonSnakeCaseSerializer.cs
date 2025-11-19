using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace ClinicApi.Tests.Utilities;

public static class JsonSnakeCaseSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        WriteIndented = false,
        PropertyNameCaseInsensitive = true
    };

    public static StringContent From(object payload)
    {
        var json = JsonSerializer.Serialize(payload, Options);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    public static JsonSerializerOptions SerializerOptions => Options;
}
