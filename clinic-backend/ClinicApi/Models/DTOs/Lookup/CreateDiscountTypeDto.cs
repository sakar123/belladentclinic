using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class CreateDiscountTypeDto
    {
        [Required]
        [StringLength(50)]
        public required string discount_name { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal discount_percentage { get; set; }
    }
}
