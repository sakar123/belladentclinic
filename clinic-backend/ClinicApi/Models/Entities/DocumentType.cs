using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ClinicApi.Models.Entities
{
    public class DocumentType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(25)]
        [Column("document_type")]
        public string document_type_code { get; set; }
        
        [Required]
        [StringLength(50)]
        public string name { get; set; }
        
        [StringLength(200)]
        public string? description { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        
        [InverseProperty("document_type")]
        public virtual ICollection<Document> documents { get; set; } = new List<Document>();
    }
}
