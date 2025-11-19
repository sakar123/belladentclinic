using System;
using System.ComponentModel.DataAnnotations;
using ClinicApi.Models.Enumerations;

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
        public PaymentMethodEnum  method { get; set; }
        
        [StringLength(255)]
        public string? transaction_ref { get; set; }
        
        [Required]
        public string? created_by { get; set; }
    }
}
