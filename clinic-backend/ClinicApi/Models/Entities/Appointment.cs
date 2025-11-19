using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicApi.Models.Entities;

namespace ClinicApi.Models.Entities
{
    public class Appointment 
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public Guid staff_id { get; set; }
        
        [Required]
        public Guid status_id { get; set; }
        
        [Required]
        public DateTime appointment_start_time { get; set; }
        
        [Required]
        [Range(1, 480)]
        public int duration_minutes { get; set; }
        
        [StringLength(1000)]
        public string? reason_for_visit { get; set; }
        
        [StringLength(2000)]
        public string? notes { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
        
        [ForeignKey("patient_id")]
        public virtual required Patient patient { get; set; }
        
        [ForeignKey("staff_id")]
        public virtual required Staff staff { get; set; }
        
        [ForeignKey("status_id")]
        public virtual required AppointmentStatus status { get; set; }
        
        [InverseProperty("Appointment")]
        public virtual required ICollection<Treatment> treatments { get; set; }
    }
}
