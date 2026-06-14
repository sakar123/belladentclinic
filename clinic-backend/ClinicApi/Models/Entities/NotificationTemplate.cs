using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class NotificationTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        [StringLength(100)]
        public required string code { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; } // Email, SMS

        [Required]
        [StringLength(10)]
        public string audience_scope { get; set; } = "Any"; // Patient, Staff, Any

        [Required]
        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES"; // AmazonSES, GenericSMTP, SMS, Other

        [StringLength(255)]
        public string? subject_template { get; set; }

        public string? body_text { get; set; }
        public string? body_html { get; set; }

        public bool is_active { get; set; } = true;
        public string? description { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("topic_id")]
        public virtual NotificationTopic? topic { get; set; }

        [InverseProperty("template")]
        public virtual ICollection<Notification> notifications { get; set; }

        public NotificationTemplate()
        {
            notifications = new HashSet<Notification>();
        }
    }
}
