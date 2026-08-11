using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services.Implementations
{
    public class AdvancedOdontogramMapper : IAdvancedOdontogramMapper
    {
        private const string ChartVersion = "2.19";

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        };

        private static readonly Dictionary<int, int> PrimaryToAdvancedSlot = new()
        {
            [51] = 11, [52] = 12, [53] = 13, [54] = 14, [55] = 15,
            [61] = 21, [62] = 22, [63] = 23, [64] = 24, [65] = 25,
            [71] = 31, [72] = 32, [73] = 33, [74] = 34, [75] = 35,
            [81] = 41, [82] = 42, [83] = 43, [84] = 44, [85] = 45
        };

        private static readonly Dictionary<int, int> AdvancedSlotToPrimary = PrimaryToAdvancedSlot
            .ToDictionary(kvp => kvp.Value, kvp => kvp.Key);

        public AdvancedOdontogramCharts BuildCharts(Patient patient, IReadOnlyList<Tooth> teeth, PatientOdontogramSnapshot? snapshot)
        {
            if (snapshot != null && !string.IsNullOrWhiteSpace(snapshot.payload))
            {
                using var snapshotDoc = JsonDocument.Parse(snapshot.payload);
                var root = snapshotDoc.RootElement;
                var status = TryGetObject(root, "statusChart")
                    ?? TryGetObject(root, "status_chart")
                    ?? TryGetObject(root, "chart")
                    ?? (LooksLikeChart(root) ? root : default);

                var plan = TryGetObject(root, "planChart")
                    ?? TryGetObject(root, "plan_chart")
                    ?? TryGetObject(root, "_planChart")
                    ?? TryGetObject(root, "plan")
                    ?? default;

                if (LooksLikeChart(status))
                {
                    var planChart = LooksLikeChart(plan) ? plan.Clone() : CreateEmptyChart();
                    return new AdvancedOdontogramCharts(status.Clone(), planChart);
                }
            }

            return new AdvancedOdontogramCharts(BuildStatusChartFromTeeth(teeth, patient), CreateEmptyChart());
        }

        public IReadOnlyList<ParsedOdontogramToothState> ParseChart(Guid patientId, string chartKind, JsonElement chart, IReadOnlyList<Tooth> teeth, Patient patient)
        {
            var result = new List<ParsedOdontogramToothState>();
            if (!LooksLikeChart(chart) || !chart.TryGetProperty("teeth", out var teethElement) || teethElement.ValueKind != JsonValueKind.Object)
            {
                return result;
            }

            foreach (var property in teethElement.EnumerateObject())
            {
                if (!int.TryParse(property.Name, out var advancedNumber))
                {
                    continue;
                }

                var state = property.Value.ValueKind == JsonValueKind.Object ? property.Value : CreateEmptyToothState();
                var backendNumber = AdvancedToBackendToothNumber(advancedNumber, state, teeth, patient);
                if (!backendNumber.HasValue)
                {
                    continue;
                }

                var tooth = teeth.FirstOrDefault(t => t.tooth_number == backendNumber.Value);
                var stateJson = state.GetRawText();
                result.Add(new ParsedOdontogramToothState(
                    patientId,
                    tooth?.id,
                    backendNumber.Value,
                    advancedNumber,
                    chartKind,
                    state.Clone(),
                    stateJson,
                    Hash(stateJson),
                    TryGetString(state, "note"),
                    chartKind.Equals("Status", StringComparison.OrdinalIgnoreCase) ? ProjectStatusCode(state) : null));
            }

            return result;
        }

        public int? AdvancedToBackendToothNumber(int advancedToothNumber, JsonElement state, IReadOnlyList<Tooth> teeth, Patient patient)
        {
            var isMilkTooth = TryGetString(state, "toothSelection") == "milktooth";
            var legacyPrimary = UsesLegacyPrimaryUniversal(teeth, patient);

            var exact = teeth.FirstOrDefault(t =>
                BackendToAdvancedToothNumber(t.tooth_number, legacyPrimary) == advancedToothNumber &&
                IsBackendPrimaryTooth(t.tooth_number, legacyPrimary) == isMilkTooth);
            if (exact != null)
            {
                return exact.tooth_number;
            }

            var anyMapped = teeth.FirstOrDefault(t => BackendToAdvancedToothNumber(t.tooth_number, legacyPrimary) == advancedToothNumber);
            if (anyMapped != null)
            {
                return anyMapped.tooth_number;
            }

            if (isMilkTooth && AdvancedSlotToPrimary.TryGetValue(advancedToothNumber, out var primary))
            {
                return primary;
            }

            return IsPermanentFdi(advancedToothNumber) ? advancedToothNumber : null;
        }

        public string? InferProposedSurfaces(JsonElement state)
        {
            var codes = new SortedSet<string>(StringComparer.OrdinalIgnoreCase);
            AddSurfaceCodes(codes, state, "caries");
            AddSurfaceCodes(codes, state, "secondaryCaries");
            AddSurfaceCodes(codes, state, "fillingSurfaces");
            AddSurfaceCodes(codes, state, "fillingDefect");
            AddSurfaceCodes(codes, state, "cariesSeverity");
            return codes.Count == 0 ? null : string.Concat(codes);
        }

        internal static int? BackendToAdvancedToothNumber(int toothNumber, bool legacyPrimary)
        {
            if (legacyPrimary && toothNumber >= 1 && toothNumber <= 20)
            {
                var primaryFdi = toothNumber switch
                {
                    <= 5 => 50 + toothNumber,
                    <= 10 => 60 + (toothNumber - 5),
                    <= 15 => 70 + (toothNumber - 10),
                    _ => 80 + (toothNumber - 15)
                };
                return PrimaryToAdvancedSlot.TryGetValue(primaryFdi, out var slot) ? slot : null;
            }

            if (IsPrimaryFdi(toothNumber))
            {
                return PrimaryToAdvancedSlot.TryGetValue(toothNumber, out var slot) ? slot : null;
            }

            if (IsPermanentFdi(toothNumber))
            {
                return toothNumber;
            }

            if (toothNumber >= 1 && toothNumber <= 32)
            {
                return toothNumber switch
                {
                    <= 8 => 19 - toothNumber,
                    <= 16 => toothNumber + 12,
                    <= 24 => 55 - toothNumber,
                    _ => toothNumber + 16
                };
            }

            return null;
        }

        private JsonElement BuildStatusChartFromTeeth(IReadOnlyList<Tooth> teeth, Patient patient)
        {
            var legacyPrimary = UsesLegacyPrimaryUniversal(teeth, patient);
            var advancedTeeth = new Dictionary<string, object?>();
            foreach (var tooth in teeth)
            {
                var advancedNumber = BackendToAdvancedToothNumber(tooth.tooth_number, legacyPrimary);
                if (!advancedNumber.HasValue)
                {
                    continue;
                }

                advancedTeeth[advancedNumber.Value.ToString()] = BuildToothState(tooth, legacyPrimary);
            }

            return ToJsonElement(new
            {
                version = ChartVersion,
                globals = DefaultGlobals(),
                teeth = advancedTeeth
            });
        }

        private static object BuildToothState(Tooth tooth, bool legacyPrimary)
        {
            var code = (tooth.tooth_status?.code ?? string.Empty).ToUpperInvariant();
            var state = new Dictionary<string, object?>();
            state["toothSelection"] = IsBackendPrimaryTooth(tooth.tooth_number, legacyPrimary) ? "milktooth" : "tooth-base";

            if (code.Contains("MISSING"))
            {
                return new Dictionary<string, object?> { ["toothSelection"] = "none" };
            }
            if (code.Contains("EXTRACT"))
            {
                return new Dictionary<string, object?> { ["toothSelection"] = "none", ["extractionWound"] = true };
            }
            if (code.Contains("IMPACT"))
            {
                return new Dictionary<string, object?> { ["toothSelection"] = "tooth-under-gum" };
            }
            if (code.Contains("IMPLANT"))
            {
                return new Dictionary<string, object?> { ["toothSelection"] = "implant" };
            }
            if (code.Contains("BRIDGE") || code.Contains("PONTIC"))
            {
                state["restorationType"] = "bridge";
                state["restorationMaterial"] = "metal-ceramic";
            }
            else if (code.Contains("VENEER"))
            {
                state["restorationType"] = "veneer";
                state["restorationMaterial"] = "metal-ceramic";
            }
            else if (code.Contains("CROWN"))
            {
                state["restorationType"] = "crown";
                state["restorationMaterial"] = "metal-ceramic";
            }
            if (code.Contains("FILLED") || code.Contains("FILLING"))
            {
                state["fillingMaterial"] = "composite";
            }
            if (code.Contains("RCT") || code.Contains("ROOT_CANAL"))
            {
                state["endo"] = "endo-filling";
            }
            if (code.Contains("CARIES") || code.Contains("CAVITY"))
            {
                state["caries"] = new[] { "occlusal" };
            }
            if (code.Contains("CALCULUS"))
            {
                state["calculus"] = true;
            }
            if (code.Contains("FRACT"))
            {
                state["toothSubstrate"] = "broken";
            }
            if (code.Contains("PERIOD") || code.Contains("ABSCESS"))
            {
                state["mods"] = new[] { "inflammation" };
            }

            if (!code.Contains("HEALTHY") && !string.IsNullOrWhiteSpace(tooth.tooth_status?.description))
            {
                state["note"] = tooth.tooth_status.description;
            }

            return state;
        }

        private static string? ProjectStatusCode(JsonElement state)
        {
            var selection = TryGetString(state, "toothSelection");
            if (selection == "none")
            {
                return TryGetBool(state, "extractionWound") ? "EXTRACTED" : "MISSING";
            }
            if (selection == "implant") return "IMPLANT";
            if (selection == "tooth-under-gum") return "IMPACTED";

            var restoration = TryGetString(state, "restorationType");
            if (restoration == "bridge") return "BRIDGE";
            if (restoration == "veneer") return "VENEER";
            if (restoration == "crown") return "CROWNED";

            var endo = TryGetString(state, "endo");
            if (!string.IsNullOrWhiteSpace(endo) && endo != "none") return endo.Contains("post", StringComparison.OrdinalIgnoreCase) ? "POST" : "RCT";

            if (HasAnyValue(state, "fillingSurfaces") || HasMeaningfulString(state, "fillingMaterial", "none")) return "FILLED";
            if (HasAnyValue(state, "caries") || HasAnyValue(state, "secondaryCaries") || HasAnyValue(state, "rootCaries")) return "CARIES";
            if (TryGetBool(state, "calculus")) return "CALCULUS";
            if (HasAnyValue(state, "mods")) return "PERIODONTITIS";
            if (TryGetString(state, "toothSubstrate") == "broken") return "FRACTURED";

            return selection == "milktooth" || selection == "tooth-base" || string.IsNullOrWhiteSpace(selection) ? "HEALTHY" : null;
        }

        private static JsonElement? TryGetObject(JsonElement element, string propertyName)
        {
            if (element.ValueKind == JsonValueKind.Object &&
                element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.Object)
            {
                return property;
            }

            return null;
        }

        private static bool LooksLikeChart(JsonElement element)
        {
            return element.ValueKind == JsonValueKind.Object &&
                element.TryGetProperty("version", out _) &&
                element.TryGetProperty("teeth", out var teeth) &&
                teeth.ValueKind == JsonValueKind.Object;
        }

        private static JsonElement CreateEmptyChart()
        {
            return ToJsonElement(new { version = ChartVersion, globals = DefaultGlobals(), teeth = new Dictionary<string, object>() });
        }

        private static JsonElement CreateEmptyToothState()
        {
            return ToJsonElement(new { toothSelection = "tooth-base" });
        }

        private static object DefaultGlobals()
        {
            return new
            {
                wisdomVisible = true,
                showBase = true,
                occlusalVisible = true,
                showHealthyPulp = true,
                edentulous = false
            };
        }

        private static bool UsesLegacyPrimaryUniversal(IReadOnlyList<Tooth> teeth, Patient patient)
        {
            var numbers = teeth.Select(t => t.tooth_number).ToList();
            if (numbers.Count == 0 || !numbers.All(n => n >= 1 && n <= 20))
            {
                return false;
            }

            var dob = patient.Person?.date_of_birth;
            if (!dob.HasValue)
            {
                return false;
            }

            var today = DateTime.UtcNow.Date;
            var age = today.Year - dob.Value.Year;
            if (dob.Value.Date > today.AddYears(-age))
            {
                age--;
            }

            return age < 14;
        }

        private static bool IsBackendPrimaryTooth(int toothNumber, bool legacyPrimary)
        {
            return IsPrimaryFdi(toothNumber) || (legacyPrimary && toothNumber >= 1 && toothNumber <= 20);
        }

        private static bool IsPermanentFdi(int toothNumber)
        {
            var quadrant = toothNumber / 10;
            var position = toothNumber % 10;
            return quadrant >= 1 && quadrant <= 4 && position >= 1 && position <= 8;
        }

        private static bool IsPrimaryFdi(int toothNumber)
        {
            var quadrant = toothNumber / 10;
            var position = toothNumber % 10;
            return quadrant >= 5 && quadrant <= 8 && position >= 1 && position <= 5;
        }

        private static string? TryGetString(JsonElement state, string propertyName)
        {
            if (state.ValueKind == JsonValueKind.Object &&
                state.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.String)
            {
                return property.GetString();
            }

            return null;
        }

        private static bool TryGetBool(JsonElement state, string propertyName)
        {
            return state.ValueKind == JsonValueKind.Object &&
                state.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.True;
        }

        private static bool HasMeaningfulString(JsonElement state, string propertyName, string ignoredValue)
        {
            var value = TryGetString(state, propertyName);
            return !string.IsNullOrWhiteSpace(value) && !value.Equals(ignoredValue, StringComparison.OrdinalIgnoreCase);
        }

        private static bool HasAnyValue(JsonElement state, string propertyName)
        {
            if (state.ValueKind != JsonValueKind.Object || !state.TryGetProperty(propertyName, out var property))
            {
                return false;
            }

            return property.ValueKind switch
            {
                JsonValueKind.Array => property.GetArrayLength() > 0,
                JsonValueKind.Object => property.EnumerateObject().Any(),
                JsonValueKind.String => !string.IsNullOrWhiteSpace(property.GetString()),
                JsonValueKind.True => true,
                JsonValueKind.Number => true,
                _ => false
            };
        }

        private static void AddSurfaceCodes(SortedSet<string> codes, JsonElement state, string propertyName)
        {
            if (state.ValueKind != JsonValueKind.Object || !state.TryGetProperty(propertyName, out var property))
            {
                return;
            }

            if (property.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in property.EnumerateArray())
                {
                    AddSurfaceCode(codes, item.ValueKind == JsonValueKind.String ? item.GetString() : null);
                }
            }
            else if (property.ValueKind == JsonValueKind.Object)
            {
                foreach (var item in property.EnumerateObject())
                {
                    AddSurfaceCode(codes, item.Name);
                }
            }
            else if (property.ValueKind == JsonValueKind.String)
            {
                AddSurfaceCode(codes, property.GetString());
            }
        }

        private static void AddSurfaceCode(SortedSet<string> codes, string? surface)
        {
            var normalized = (surface ?? string.Empty).Trim().ToLowerInvariant();
            var code = normalized switch
            {
                "mesial" or "m" => "M",
                "distal" or "d" => "D",
                "occlusal" or "o" => "O",
                "buccal" or "b" => "B",
                "lingual" or "l" or "palatal" or "p" => "L",
                "facial" or "f" => "F",
                "incisal" or "i" => "I",
                "cervical" or "c" => "C",
                _ => null
            };
            if (code != null)
            {
                codes.Add(code);
            }
        }

        private static string Hash(string value)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static JsonElement ToJsonElement(object value)
        {
            using var doc = JsonDocument.Parse(JsonSerializer.Serialize(value, JsonOptions));
            return doc.RootElement.Clone();
        }
    }
}
