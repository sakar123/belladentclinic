using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class OdontogramToothState
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        public Guid? tooth_id { get; set; }

        [Required]
        public int backend_tooth_number { get; set; }

        [Required]
        public int advanced_tooth_number { get; set; }

        [Required]
        [StringLength(20)]
        public string chart_kind { get; set; } = "Status";

        [Required]
        public required string state_json { get; set; }

        [Required]
        [StringLength(128)]
        public required string state_hash { get; set; }

        public string? note { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? updated_by { get; set; }

        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }

        [ForeignKey("tooth_id")]
        public virtual Tooth? tooth { get; set; }
    }
}
