using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using ClinicApi.Models.Entities;

namespace ClinicApi.Models.Entities
{
    public class Patient
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid person_id { get; set; }
        
        [StringLength(100)]
        public string? emergency_contact_name { get; set; }
        
        [StringLength(20)]
        public string? emergency_contact_phone { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("person_id")]
        public virtual required Person Person { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<Appointment> appointments { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<Treatment> treatments { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<Billing> billings { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<Tooth> teeth { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<Document> documents { get; set; }
        
        [InverseProperty("patient")]
        public virtual required ICollection<SaleItem> sale_items { get; set; }
    }
}
