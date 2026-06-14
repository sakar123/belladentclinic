using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationRecipientDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid notification_id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        public Guid? contact_method_id { get; set; }

        [Required]
        [StringLength(255)]
        public required string recipient_address { get; set; }

        [StringLength(10)]
        public string recipient_type { get; set; } = "Primary";

        [StringLength(20)]
        public string delivery_status { get; set; } = "Queued";

        [StringLength(255)]
        public string? provider_message_id { get; set; }

        public DateTime? sent_at { get; set; }
        public DateTime? delivered_at { get; set; }
        public DateTime? opened_at { get; set; }
        public DateTime? clicked_at { get; set; }
        public DateTime? failed_at { get; set; }
        public string? failure_reason { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
