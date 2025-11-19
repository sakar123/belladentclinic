using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class DocumentDTO
    {
        public Guid? id { get; set; }
        
        public Guid? tooth_id { get; set; }
        
        public Guid? treatment_id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public Guid document_type_id { get; set; }
        
        [Required]
        public DateTime upload_date { get; set; }
        
        [Required]
        [StringLength(500)]
        public required string description { get; set; }
        
        public bool is_sensitive { get; set; } = false;
        
        [Required]
        [StringLength(500)]
        public required string document_path { get; set; }
    }
}
