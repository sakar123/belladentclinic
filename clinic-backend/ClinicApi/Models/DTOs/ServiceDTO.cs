using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class ServiceDTO
    {
        public Guid? id { get; set; }
        
        public Guid? specialty_id { get; set; }
        
        public Guid? resulting_tooth_status_id { get; set; }
        public string? resulting_tooth_status_code { get; set; }
        
        [StringLength(30)]
        public string? visual_cue_code { get; set; }
        
        [Required]
        [StringLength(100)]
        public string name { get; set; }
        
        [StringLength(1000)]
        public string? description { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal cost { get; set; }
    }
}
