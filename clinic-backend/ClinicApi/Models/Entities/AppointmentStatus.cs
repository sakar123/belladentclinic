using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using ClinicApi.Models.Entities;

namespace ClinicApi.Models.Entities
{
    public class AppointmentStatus
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string name { get; set; }
        
        [InverseProperty("status")]
        public virtual ICollection<Appointment> appointments { get; set; } = new List<Appointment>();
    }
}
