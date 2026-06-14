using System;
using System.Collections.Generic;

namespace ClinicApi.Services
{
    public class ToothStatusValidationResult
    {
        public bool IsValid { get; init; }
        public string? Reason { get; init; }
        public string? CurrentStatus { get; init; }
        public string? NewStatus { get; init; }
    }

    public static class ToothStatusValidator
    {
        private static readonly Dictionary<string, HashSet<string>> IncompatibleStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            ["HEALTHY"] = new(StringComparer.OrdinalIgnoreCase) { "FILLED", "CARIES", "CROWNED", "BRIDGE", "RCT", "POST", "IMPLANT" },
            ["MISSING"] = new(StringComparer.OrdinalIgnoreCase) { "HEALTHY", "FILLED", "CARIES", "CROWNED", "RCT", "POST", "PULPITIS", "VENEER" },
            ["EXTRACTED"] = new(StringComparer.OrdinalIgnoreCase) { "HEALTHY", "FILLED", "CARIES", "CROWNED", "RCT", "POST", "PULPITIS", "VENEER", "IMPLANT" },
            ["IMPLANT"] = new(StringComparer.OrdinalIgnoreCase) { "HEALTHY", "APICAL_LESION", "TEMPORARY", "MISSING", "FILLED", "PULPITIS", "NECROSIS" },
            ["PONTIC"] = new(StringComparer.OrdinalIgnoreCase) { "HEALTHY", "FILLED", "CARIES", "RCT", "POST" },
            ["BRIDGE"] = new(StringComparer.OrdinalIgnoreCase) { "CARIES", "RCT", "POST" },
            ["CROWNED"] = new(StringComparer.OrdinalIgnoreCase) { "IMPLANT", "PONTIC" },
        };

        public static ToothStatusValidationResult Validate(string? currentStatus, string? newStatus)
        {
            var curr = (currentStatus ?? string.Empty).Trim().ToUpperInvariant();
            var next = (newStatus ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrEmpty(curr) || string.IsNullOrEmpty(next))
            {
                return new ToothStatusValidationResult { IsValid = true, CurrentStatus = curr, NewStatus = next };
            }

            if (IncompatibleStatuses.TryGetValue(curr, out var set) && set.Contains(next))
            {
                return new ToothStatusValidationResult
                {
                    IsValid = false,
                    CurrentStatus = curr,
                    NewStatus = next,
                    Reason = $"Transition from {curr} to {next} is incompatible."
                };
            }

            return new ToothStatusValidationResult { IsValid = true, CurrentStatus = curr, NewStatus = next };
        }
    }
}

