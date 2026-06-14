using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid billing_id { get; set; }
        
        [Required]
        [Range(0.01, 999999.99)]
        public decimal amount { get; set; }
        
        [Required]
        public DateTime payment_date { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string method { get; set; }
        
        [StringLength(255)]
        public string? transaction_ref { get; set; }
        
        [StringLength(2000)]
        public string? notes { get; set; }
        
        [Required]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public required string created_by { get; set; }
        
        [ForeignKey("billing_id")]
        public virtual required Billing billing { get; set; }
    }
}
