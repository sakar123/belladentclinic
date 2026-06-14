using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class BillingDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public DateTime issue_date { get; set; }
        
        [Required]
        public DateTime due_date { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal total_amount { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal amount_paid { get; set; }
        
        [Required]
        public string status { get; set; }

        [StringLength(2000)]
        public string? notes { get; set; }

        // Read-only enrichments (populated when navs are included)
        public string? patient_name { get; set; }
        public string? patient_email { get; set; }
        public string? patient_phone { get; set; }
        public List<BillingLineItemDTO>? line_items { get; set; }
        public List<PaymentDTO>? payments { get; set; }
    }
}
