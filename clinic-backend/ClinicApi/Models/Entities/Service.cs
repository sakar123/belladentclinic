using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class Service
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        public Guid? specialty_id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string name { get; set; }
        
        [StringLength(1000)]
        public string? description { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal cost { get; set; }
        
        [ForeignKey("specialty_id")]
        public virtual Specialty? specialty { get; set; }
        
        [InverseProperty("service")]
        public virtual ICollection<Treatment> treatments { get; set; } = new List<Treatment>();

        // Declares allowed tooth scopes for this service via service_tooth_scope
        public virtual ICollection<ServiceToothScope> tooth_scopes { get; set; } = new List<ServiceToothScope>();
    }
}
