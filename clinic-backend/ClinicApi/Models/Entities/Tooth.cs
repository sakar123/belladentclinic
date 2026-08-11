using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class Tooth
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid patient_id { get; set; }

        [Required]
        [Range(1, 99)]
        public int tooth_number { get; set; }

        [Required]
        [StringLength(50)]
        public required string tooth_name { get; set; }

        [Required]
        public Guid tooth_status_id { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("patient_id")]
        public virtual required Patient patient { get; set; }

        [ForeignKey("tooth_status_id")]
        public virtual required ToothStatus tooth_status { get; set; }

        public virtual ICollection<Treatment> treatments { get; set; } = new List<Treatment>();

        [InverseProperty("tooth")]
        public virtual ICollection<Document> documents { get; set; } = new List<Document>();
        
    }
}
