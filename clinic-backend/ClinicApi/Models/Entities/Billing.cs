using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class Billing
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public DateTime issue_date { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime due_date { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal total_amount { get; set; } = 0.00m;
        
        [Required]
        [Range(0, 999999.99)]
        public decimal amount_paid { get; set; } = 0.00m;
        
        [Required]
        public string status { get; set; } = "Draft";

        [StringLength(2000)]
        public string? notes { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("patient_id")]
        public virtual required Patient patient { get; set; }
        
        [InverseProperty("billing")]
        public virtual required ICollection<BillingLineItem> billing_line_Item { get; set; }
        
        [InverseProperty("billing")]
        public virtual required ICollection<Payment> payment { get; set; }
    }
}
