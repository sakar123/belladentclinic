using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class Specialty
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string name { get; set; }
        
        [StringLength(1000)]
        public string? description { get; set; }
        
        [InverseProperty("specialty")]
        public virtual ICollection<Staff> staff { get; set; } = new List<Staff>();
        
        [InverseProperty("specialty")]
        public virtual ICollection<Service> services { get; set; } = new List<Service>();
    }
}
