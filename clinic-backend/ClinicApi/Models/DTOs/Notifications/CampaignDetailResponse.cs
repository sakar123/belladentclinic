using System;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CampaignDetailResponse
    {
        public Guid id { get; set; }
        public string name { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
        public string topic_code { get; set; } = string.Empty;
        public string channel { get; set; } = string.Empty;
        public string audience_type { get; set; } = string.Empty;
        public string? template_code { get; set; }
        public DateTime? scheduled_at { get; set; }
        public DateTime? launched_at { get; set; }
        public DateTime? completed_at { get; set; }
        public string? description { get; set; }
        public string? created_by { get; set; }
        public DateTime created_at { get; set; }
    }
}
