using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class DiscountType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string discount_name { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal discount_percentage { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [InverseProperty("discount_type")]
        public virtual ICollection<SaleItem> sale_item { get; set; }
    }
}
