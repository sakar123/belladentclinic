using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class AppointmentDTO
    {
        public Guid? id { get; set; }
        
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
        public required string reason_for_visit { get; set; }
        
        [StringLength(2000)]
        public string? notes { get; set; }
    }
}


