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

        // Either tooth_id or tooth_number can be provided for create/update.
        // When tooth_id is not provided, services will try to resolve using (patient_id, tooth_number).
        public Guid? tooth_id { get; set; }

        public int? tooth_number { get; set; }
        
        [StringLength(2000)]
        public string notes { get; set; }
    }
}
