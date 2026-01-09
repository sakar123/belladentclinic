using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class CreateDocumentTypeDto
    {
        [Required]
        [StringLength(25)]
        public string document_type_code { get; set; }
        
        [Required]
        [StringLength(50)]
        public string name { get; set; }
        
        [StringLength(200)]
        public string? description { get; set; }
    }
}
