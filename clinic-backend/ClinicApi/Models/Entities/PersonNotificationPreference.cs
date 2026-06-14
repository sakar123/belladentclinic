using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class PersonNotificationPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; } // Email, SMS

        public bool is_enabled { get; set; } = true;

        [Required]
        [StringLength(20)]
        public string opt_in_status { get; set; } = "Implicit"; // Implicit, Explicit, OptedOut

        public DateTime? opted_in_at { get; set; }
        public DateTime? opted_out_at { get; set; }

        [StringLength(100)]
        public string? source { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("person_id")]
        public virtual Person? person { get; set; }

        [ForeignKey("topic_id")]
        public virtual NotificationTopic? topic { get; set; }
    }
}
