using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class DiscountTypeDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string? discount_name { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal discount_percentage { get; set; }
    }
}
