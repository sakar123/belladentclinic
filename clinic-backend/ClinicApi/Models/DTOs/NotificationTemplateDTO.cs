using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationTemplateDTO
    {
        public Guid? id { get; set; }

        [Required]
        [StringLength(100)]
        public required string code { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        [StringLength(10)]
        public string audience_scope { get; set; } = "Any";

        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES";

        [StringLength(255)]
        public string? subject_template { get; set; }

        public string? body_text { get; set; }
        public string? body_html { get; set; }

        public bool is_active { get; set; } = true;
        public string? description { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
