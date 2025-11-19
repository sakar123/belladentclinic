using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class TreatmentDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid appointment_id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public Guid staff_id { get; set; }
        
        [Required]
        public Guid service_id { get; set; }

        [Required]
        public Guid tooth_id { get; set; }

        public int? tooth_number { get; set; }
        
        [StringLength(2000)]
        public string notes { get; set; }
    }
}
