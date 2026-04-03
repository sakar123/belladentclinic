using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationCampaignDTO
    {
        public Guid? id { get; set; }

        [Required]
        [StringLength(150)]
        public required string name { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        public Guid? template_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        [StringLength(10)]
        public string audience_scope { get; set; } = "Any";

        [StringLength(20)]
        public string status { get; set; } = "Draft";

        public DateTime? scheduled_at { get; set; }
        public DateTime? launched_at { get; set; }
        public DateTime? completed_at { get; set; }

        public string? description { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
