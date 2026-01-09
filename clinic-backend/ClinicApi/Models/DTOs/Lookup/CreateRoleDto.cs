using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class CreateRoleDto
    {
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
        
        [StringLength(1000)]
        public string? description { get; set; }
    }
}
