using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class ToothStatusDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [StringLength(25)]
        public string code { get; set; }
        
        [StringLength(200)]
        public string description { get; set; }
    }
}
