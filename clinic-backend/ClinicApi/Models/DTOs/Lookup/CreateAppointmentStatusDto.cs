using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class CreateAppointmentStatusDto
    {
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
    }
}
