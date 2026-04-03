using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class NotificationProviderEvent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid notification_recipient_id { get; set; }

        [Required]
        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES"; // AmazonSES, GenericSMTP, SMS, Other

        [Required]
        [StringLength(25)]
        public required string event_type { get; set; } // Send, Delivery, Bounce, Complaint, Reject, Open, Click, RenderingFailure, DeliveryDelay, SubscriptionChange

        public DateTime event_time { get; set; } = DateTime.UtcNow;

        public string? payload { get; set; } // JSONB in DB

        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("notification_recipient_id")]
        public virtual NotificationRecipient? notification_recipient { get; set; }
    }
}
