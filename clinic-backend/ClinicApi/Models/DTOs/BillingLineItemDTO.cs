using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class BillingLineItemDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid billing_id { get; set; }
        
        public Guid? treatment_id { get; set; }
        public Guid? service_id { get; set; }
        public string? line_item_type { get; set; }
        
        [Required]
        [StringLength(1000)]
        public required string description { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int quantity { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal unit_price { get; set; }
        
        [Range(0, 100)]
        public decimal discount_percentage { get; set; }

        // Read-only enrichments
        public string? service_name { get; set; }
        public string? treatment_notes { get; set; }
        public string? staff_name { get; set; }
        public Guid? appointment_id { get; set; }
    }
}
