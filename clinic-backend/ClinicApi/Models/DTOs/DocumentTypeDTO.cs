using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class DocumentTypeDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [StringLength(25)]
        public required string document_type { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
        
        [StringLength(200)]
        public string? description { get; set; }
    }
}
