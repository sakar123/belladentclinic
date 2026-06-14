using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class ToothStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(25)]
        public string code { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string? description { get; set; }

        [StringLength(7)]
        public string? color { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        
        [InverseProperty("tooth_status")]
        public virtual ICollection<Tooth> teeth { get; set; } = new List<Tooth>();
    }
}
