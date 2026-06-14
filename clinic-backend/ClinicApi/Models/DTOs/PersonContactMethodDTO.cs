using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PersonContactMethodDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        [Required]
        [StringLength(255)]
        public required string contact_value { get; set; }

        public bool is_primary { get; set; } = false;
        public bool is_verified { get; set; } = false;
        public bool is_active { get; set; } = true;
        public DateTime? verified_at { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
