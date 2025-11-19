using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class AppointmentStatusDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
    }
}
