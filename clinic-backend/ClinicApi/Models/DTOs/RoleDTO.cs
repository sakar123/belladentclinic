using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class RoleDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string name { get; set; }
        
        [StringLength(1000)]
        public string description { get; set; }
    }
}
