using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        public Guid? template_id { get; set; }
        public Guid? campaign_id { get; set; }
        public Guid? appointment_id { get; set; }
        public Guid? patient_id { get; set; }
        public Guid? staff_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; } // Email, SMS

        [Required]
        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES"; // AmazonSES, GenericSMTP, SMS, Other

        [Required]
        [StringLength(20)]
        public string status { get; set; } = "Queued"; // Queued, Processing, Sent, Partial, Failed, Cancelled

        [StringLength(255)]
        public string? subject_rendered { get; set; }

        public string? body_rendered_text { get; set; }
        public string? body_rendered_html { get; set; }

        public DateTime? scheduled_for { get; set; }
        public DateTime? processed_at { get; set; }

        public string? error_message { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("topic_id")]
        public virtual NotificationTopic? topic { get; set; }

        [ForeignKey("template_id")]
        public virtual NotificationTemplate? template { get; set; }

        [ForeignKey("campaign_id")]
        public virtual NotificationCampaign? campaign { get; set; }

        [ForeignKey("appointment_id")]
        public virtual Appointment? appointment { get; set; }

        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }

        [ForeignKey("staff_id")]
        public virtual Staff? staff { get; set; }

        [InverseProperty("notification")]
        public virtual ICollection<NotificationRecipient> recipients { get; set; }

        public Notification()
        {
            recipients = new HashSet<NotificationRecipient>();
        }
    }
}
