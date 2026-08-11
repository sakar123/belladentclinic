using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class PatientOdontogramSnapshot
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        [Required]
        public required string payload { get; set; }

        [Required]
        [StringLength(50)]
        public string source_version { get; set; } = "react-advanced-odontogram";

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }
    }
}
