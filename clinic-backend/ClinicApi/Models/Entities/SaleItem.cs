using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class SaleItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int quantity { get; set; }
        
        public Guid? discount_id { get; set; }
        
        public Guid? patient_id { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal cost { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("discount_id")]
        public virtual DiscountType? discount_type { get; set; }
        
        [ForeignKey("patient_id")]
        public virtual Patient? patient { get; set; }
    }
}
