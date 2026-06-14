using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class TreatmentToothSurface
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid treatment_id { get; set; }

        [Required]
        public Guid tooth_id { get; set; }

        [Required]
        [StringLength(10)] // e.g. "Mesial", "Distal", "Occlusal", "Buccal", "Lingual", "Facial"
        public required string surface { get; set; }

        [ForeignKey("treatment_id")]
        public virtual required Treatment treatment { get; set; }

        [ForeignKey("tooth_id")]
        public virtual required Tooth tooth { get; set; }
    }
}
