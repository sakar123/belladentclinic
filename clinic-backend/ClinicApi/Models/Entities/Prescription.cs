using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class Prescription
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid treatment_id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string drug_name { get; set; }
        
        [StringLength(100)]
        public required string dosage { get; set; }
        
        [StringLength(2000)]
        public string? instructions { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("treatment_id")]
        public virtual required Treatment treatment { get; set; }
    }
}
