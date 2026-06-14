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

        public string? status { get; set; } // Planned | InProgress | Completed | Cancelled
        public DateTime? completed_at { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }

        // Backwards compat: accept single tooth fields
        public Guid? tooth_id { get; set; }
        public int? tooth_number { get; set; }
        // New: accept multiple teeth
        public List<Guid>? tooth_ids { get; set; }
        public List<int>? tooth_numbers { get; set; }
        
        [StringLength(2000)]
        public string notes { get; set; }

        // Read-only enrichments
        public string? service_name { get; set; }
        public string? resulting_tooth_status_code { get; set; }
        public string? visual_cue_code { get; set; }
        
        [StringLength(10)]
        public string? surfaces { get; set; }

        // Optional per-tooth surface mapping when applying to multiple teeth
        // Key: tooth_number, Value: list of surface codes like ["M","O","D"]
        public Dictionary<int, List<string>>? surface_map { get; set; }
    }
}
