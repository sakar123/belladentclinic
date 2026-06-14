using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CampaignPreviewRequest
    {
        [Required]
        public required string audience_type { get; set; } // Patient, Staff

        [Required]
        public required string channel { get; set; } // Email, SMS

        [Required]
        public required string topic_code { get; set; }

        public string? template_code { get; set; }

        [Required]
        public required AudienceFilterCriteria filters { get; set; }
    }
}
