using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class OdontogramPlanItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        public Guid? appointment_id { get; set; }
        public Guid? treatment_id { get; set; }
        public int? backend_tooth_number { get; set; }
        public int? advanced_tooth_number { get; set; }

        [Required]
        [StringLength(80)]
        public required string axis { get; set; }

        public string? from_json { get; set; }

        [Required]
        public required string to_json { get; set; }

        public Guid? proposed_service_id { get; set; }

        [StringLength(20)]
        public string? proposed_surfaces { get; set; }

        [Required]
        [StringLength(30)]
        public string status { get; set; } = "Draft";

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }

        [ForeignKey("appointment_id")]
        public virtual Appointment? appointment { get; set; }

        [ForeignKey("treatment_id")]
        public virtual Treatment? treatment { get; set; }

        [ForeignKey("proposed_service_id")]
        public virtual Service? proposed_service { get; set; }
    }
}
