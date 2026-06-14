using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class NotificationRecipient
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid notification_id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        public Guid? contact_method_id { get; set; }

        [Required]
        [StringLength(255)]
        public required string recipient_address { get; set; }

        [Required]
        [StringLength(10)]
        public string recipient_type { get; set; } = "Primary"; // Primary, CC, BCC

        [Required]
        [StringLength(20)]
        public string delivery_status { get; set; } = "Queued"; // Queued, Sent, Delivered, Failed, Bounced, Complained, Rejected, Suppressed, Opened, Clicked

        [StringLength(255)]
        public string? provider_message_id { get; set; }

        public DateTime? sent_at { get; set; }
        public DateTime? delivered_at { get; set; }
        public DateTime? opened_at { get; set; }
        public DateTime? clicked_at { get; set; }
        public DateTime? failed_at { get; set; }
        public string? failure_reason { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("notification_id")]
        public virtual Notification? notification { get; set; }

        [ForeignKey("person_id")]
        public virtual Person? person { get; set; }

        [ForeignKey("contact_method_id")]
        public virtual PersonContactMethod? contact_method { get; set; }

        [InverseProperty("notification_recipient")]
        public virtual ICollection<NotificationProviderEvent> provider_events { get; set; }

        public NotificationRecipient()
        {
            provider_events = new HashSet<NotificationProviderEvent>();
        }
    }
}
