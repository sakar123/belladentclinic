using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ClinicApi.Converters
{
    public class NullableGuidEmptyToNullConverter : JsonConverter<Guid?>
    {
        public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s)) return null;
                if (Guid.TryParse(s, out var g)) return g;
                // If invalid GUID string, treat as null to avoid model binding 400 on ApiController
                return null;
            }
            if (reader.TokenType == JsonTokenType.Null) return null;
            if (reader.TokenType == JsonTokenType.StartObject || reader.TokenType == JsonTokenType.StartArray)
                throw new JsonException("Invalid token for Guid?");
            try
            {
                var g = reader.GetGuid();
                return g;
            }
            catch
            {
                return null;
            }
        }

        public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
        {
            if (value.HasValue) writer.WriteStringValue(value.Value);
            else writer.WriteNullValue();
        }
    }
}

