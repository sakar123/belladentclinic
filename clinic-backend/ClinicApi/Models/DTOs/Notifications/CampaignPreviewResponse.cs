using System;
using System.Collections.Generic;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CampaignPreviewResponse
    {
        public int matched_count { get; set; }
        public int eligible_count { get; set; }
        public int excluded_count { get; set; }
        public Dictionary<string, int> exclusions { get; set; } = new();
        public List<PreviewRecipient> sample { get; set; } = new();
    }

    public class PreviewRecipient
    {
        public Guid person_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? contact { get; set; }
        public string status { get; set; } = string.Empty; // Eligible, NoActiveContact, OptedOut, Suppressed, PreferenceDisabled
    }
}
