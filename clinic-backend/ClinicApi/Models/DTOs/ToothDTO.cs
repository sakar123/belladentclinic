using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class ToothDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        [Range(1, 32)]
        public int tooth_number { get; set; }
        
        [Required]
        [StringLength(50)]
        public string tooth_name { get; set; }
        
        [Required]
        public Guid tooth_status_id { get; set; }
    }
}
