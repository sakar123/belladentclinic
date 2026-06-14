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
        
        // If this service is completed, the affected tooth's status changes to this.
        // NULL = no status change (e.g., cleaning, X-ray, checkup)
        public Guid? resulting_tooth_status_id { get; set; }

        // Tells the frontend HOW to visually represent treatments using this service
        [StringLength(30)]
        public string? visual_cue_code { get; set; }

        [ForeignKey("resulting_tooth_status_id")]
        public virtual ToothStatus? resulting_tooth_status { get; set; }
        
        [InverseProperty("service")]
        public virtual ICollection<Treatment> treatments { get; set; } = new List<Treatment>();

        // Declares allowed tooth scopes for this service via service_tooth_scope
        public virtual ICollection<ServiceToothScope> tooth_scopes { get; set; } = new List<ServiceToothScope>();
    }
}
