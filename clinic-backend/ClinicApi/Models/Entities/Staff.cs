using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using ClinicApi.Models.Entities;

namespace ClinicApi.Models.Entities
{
    public class Staff
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid person_id { get; set; }
        
        [Required]
        public Guid role_id { get; set; }
        
        public Guid? specialty_id { get; set; }
        
        [StringLength(50)]
        public string? license_number { get; set; }
        
        public bool is_active { get; set; } = true;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("person_id")]
        public virtual Person person { get; set; } = null!;
        
        [ForeignKey("role_id")]
        public virtual Role role { get; set; } = null!;
        
        [ForeignKey("specialty_id")]
        public virtual Specialty? specialty { get; set; }
        
        [InverseProperty("staff")]
        public virtual ICollection<Appointment> appointments { get; set; } = new List<Appointment>();
        
        [InverseProperty("staff")]
        public virtual ICollection<Treatment> treatments { get; set; } = new List<Treatment>();
    }
}
