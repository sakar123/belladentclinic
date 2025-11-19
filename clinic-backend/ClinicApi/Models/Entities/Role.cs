using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class Role
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
        
        [StringLength(1000)]
        public string? description { get; set; }
        
        [InverseProperty("Role")]
        public virtual ICollection<Staff> staff { get; set; } = new List<Staff>();
    }
}
