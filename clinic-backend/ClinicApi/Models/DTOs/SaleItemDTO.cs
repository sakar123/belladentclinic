using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class SaleItemDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int quantity { get; set; }
        
        public Guid? discount_id { get; set; }
        
        public Guid? patient_id { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal cost { get; set; }
    }
}
