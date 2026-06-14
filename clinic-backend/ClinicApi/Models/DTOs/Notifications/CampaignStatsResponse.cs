using System;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CampaignStatsResponse
    {
        public Guid campaign_id { get; set; }
        public string status { get; set; } = string.Empty;
        public int targeted { get; set; }
        public int eligible { get; set; }
        public int excluded { get; set; }
        public int queued { get; set; }
        public int sent { get; set; }
        public int delivered { get; set; }
        public int bounced { get; set; }
        public int complained { get; set; }
        public int opened { get; set; }
        public int clicked { get; set; }
        public int failed { get; set; }
    }
}
