using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class OdontogramAuditEvent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        [Required]
        [StringLength(80)]
        public required string event_type { get; set; }

        [Required]
        public required string payload { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }

        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }
    }
}
