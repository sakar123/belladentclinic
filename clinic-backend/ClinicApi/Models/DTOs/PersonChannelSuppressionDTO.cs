using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PersonChannelSuppressionDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        [StringLength(255)]
        public string? contact_value { get; set; }

        [Required]
        public required string reason { get; set; }

        public DateTime suppressed_at { get; set; }
        public DateTime? expires_at { get; set; }

        public bool is_active { get; set; } = true;

        public DateTime created_at { get; set; }
        public string? created_by { get; set; }
    }
}
