using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class NotificationTopic
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        [StringLength(50)]
        public required string code { get; set; }

        [Required]
        [StringLength(100)]
        public required string name { get; set; }

        public string? description { get; set; }

        [Required]
        [StringLength(25)]
        public required string category { get; set; } // Transactional, Marketing, Operational, Greeting

        [Required]
        [StringLength(10)]
        public string audience_scope { get; set; } = "Any"; // Patient, Staff, Any

        public bool is_active { get; set; } = true;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [InverseProperty("topic")]
        public virtual ICollection<PersonNotificationPreference> preferences { get; set; }

        [InverseProperty("topic")]
        public virtual ICollection<NotificationTemplate> templates { get; set; }

        [InverseProperty("topic")]
        public virtual ICollection<NotificationCampaign> campaigns { get; set; }

        [InverseProperty("topic")]
        public virtual ICollection<Notification> notifications { get; set; }

        public NotificationTopic()
        {
            preferences = new HashSet<PersonNotificationPreference>();
            templates = new HashSet<NotificationTemplate>();
            campaigns = new HashSet<NotificationCampaign>();
            notifications = new HashSet<Notification>();
        }
    }
}
