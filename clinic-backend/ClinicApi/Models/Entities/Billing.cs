using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicApi.Models.Enumerations;
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
        public BillStatusEnum status { get; set; } = BillStatusEnum.Draft;
        
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
