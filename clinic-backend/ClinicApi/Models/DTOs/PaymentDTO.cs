using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PaymentDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid billing_id { get; set; }
        
        [Required]
        [Range(0.01, 999999.99)]
        public decimal amount { get; set; }
        
        public DateTime payment_date { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string method { get; set; }
        
        [StringLength(255)]
        public string? transaction_ref { get; set; }
        
        [StringLength(2000)]
        public string? notes { get; set; }
        
        [Required]
        public string? created_by { get; set; }
    }
}
