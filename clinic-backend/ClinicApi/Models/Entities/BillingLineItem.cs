using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class BillingLineItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid billing_id { get; set; }
        
        public Guid? treatment_id { get; set; }

        public Guid? service_id { get; set; }

        [Required]
        [StringLength(20)]
        public string line_item_type { get; set; } = "Service"; // Service | Product | Lab | Adjustment | Other
        
        [Required]
        [StringLength(1000)]
        public required string description { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int quantity { get; set; } = 1;
        
        [Required]
        [Range(0, 999999.99)]
        public decimal unit_price { get; set; }
        
        [Range(0, 100)]
        public decimal discount_percentage { get; set; } = 0.00m;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("billing_id")]
        public virtual required Billing billing { get; set; }

        [ForeignKey("treatment_id")]
        public virtual Treatment? treatment { get; set; }

        [ForeignKey("service_id")]
        public virtual Service? service { get; set; }
    }
}
