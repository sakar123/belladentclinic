using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class Document
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        public Guid? tooth_id { get; set; }
        
        public Guid? treatment_id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public Guid document_type_id { get; set; }
        
        [Required]
        public DateTime upload_date { get; set; } = DateTime.UtcNow;
        
        [Required]
        [StringLength(500)]
        public string description { get; set; }
        
        public bool is_sensitive { get; set; } = false;
        
        [Required]
        [StringLength(500)]
        public string document_path { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("tooth_id")]
        public virtual Tooth? tooth { get; set; }
        
        [ForeignKey("treatment_id")]
        public virtual Treatment? treatment { get; set; }
        
        [ForeignKey("patient_id")]
        public virtual Patient patient { get; set; } = null!;
        
        [ForeignKey("document_type_id")]
        public virtual DocumentType document_type { get; set; } = null!;
    }
}
