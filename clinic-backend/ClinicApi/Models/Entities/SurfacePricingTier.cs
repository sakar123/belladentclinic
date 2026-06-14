using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class SurfacePricingTier
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid service_id { get; set; }

        [Required]
        [Range(1, 10)]
        public int min_surfaces { get; set; }

        [Required]
        [Range(1, 10)]
        public int max_surfaces { get; set; }

        [Required]
        [Range(0.0, 100.0)]
        public decimal multiplier { get; set; } // 1.0, 1.25, 1.5, etc.

        [ForeignKey("service_id")]
        public virtual Service service { get; set; }
    }
}

