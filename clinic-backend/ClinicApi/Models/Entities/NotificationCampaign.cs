using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class NotificationCampaign
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        [StringLength(150)]
        public required string name { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        public Guid? template_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; } // Email, SMS

        [Required]
        [StringLength(10)]
        public string audience_scope { get; set; } = "Any"; // Patient, Staff, Any

        [Required]
        [StringLength(20)]
        public string status { get; set; } = "Draft"; // Draft, Scheduled, Running, Completed, Cancelled

        public DateTime? scheduled_at { get; set; }
        public DateTime? launched_at { get; set; }
        public DateTime? completed_at { get; set; }

        public string? description { get; set; }

        /// <summary>
        /// Serialized AudienceFilterCriteria JSON. Stored for re-resolution at launch time.
        /// </summary>
        public string? filter_criteria_json { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("topic_id")]
        public virtual NotificationTopic? topic { get; set; }

        [ForeignKey("template_id")]
        public virtual NotificationTemplate? template { get; set; }

        [InverseProperty("campaign")]
        public virtual ICollection<Notification> notifications { get; set; }

        public NotificationCampaign()
        {
            notifications = new HashSet<Notification>();
        }
    }
}
