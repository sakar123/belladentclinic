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

        // New schema: support scope + many-tooth linking via treatment_tooth
        public string? treatment_scope { get; set; } // NonTooth | SingleTooth | MultipleTeeth | FullMouth

        // Backwards compat: accept single tooth fields
        public Guid? tooth_id { get; set; }
        public int? tooth_number { get; set; }
        // New: accept multiple teeth
        public List<Guid>? tooth_ids { get; set; }
        public List<int>? tooth_numbers { get; set; }
        
        [StringLength(2000)]
        public string notes { get; set; }
    }
}
