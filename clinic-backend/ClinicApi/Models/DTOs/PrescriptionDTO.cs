using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PrescriptionDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid treatment_id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string drug_name { get; set; }
        
        [StringLength(100)]
        public string? dosage { get; set; }
        
        [StringLength(2000)]
        public string? instructions { get; set; }
    }
}
