using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CreateCampaignRequest
    {
        [Required]
        [StringLength(150)]
        public required string name { get; set; }

        [Required]
        public required string audience_type { get; set; } // Patient, Staff

        [Required]
        public required string topic_code { get; set; }

        [Required]
        public required string channel { get; set; } // Email, SMS

        public string? template_code { get; set; }

        [Required]
        public required AudienceFilterCriteria filters { get; set; }

        public DateTime? scheduled_at { get; set; }

        public string? initiated_by { get; set; }
    }
}
