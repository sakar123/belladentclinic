using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class PerioStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        [Required]
        public Guid staff_id { get; set; }

        [Required]
        public DateTime examination_date { get; set; } = DateTime.UtcNow;

        public bool smoker { get; set; }
        public int bone_loss { get; set; }

        [ForeignKey("patient_id")]
        public virtual required Patient patient { get; set; }

        [ForeignKey("staff_id")]
        public virtual required Staff staff { get; set; }

        public virtual ICollection<PerioMeasurement> measurements { get; set; } = new List<PerioMeasurement>();
    }
}
