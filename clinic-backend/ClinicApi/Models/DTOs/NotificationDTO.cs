using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        public Guid? template_id { get; set; }
        public Guid? campaign_id { get; set; }
        public Guid? appointment_id { get; set; }
        public Guid? patient_id { get; set; }
        public Guid? staff_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES";

        [StringLength(20)]
        public string status { get; set; } = "Queued";

        [StringLength(255)]
        public string? subject_rendered { get; set; }

        public string? body_rendered_text { get; set; }
        public string? body_rendered_html { get; set; }

        public DateTime? scheduled_for { get; set; }
        public DateTime? processed_at { get; set; }

        public string? error_message { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        public List<NotificationRecipientDTO>? recipients { get; set; }
    }
}
