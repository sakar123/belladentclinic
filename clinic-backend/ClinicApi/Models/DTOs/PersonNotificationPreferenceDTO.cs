using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PersonNotificationPreferenceDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        [Required]
        public Guid topic_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; }

        public bool is_enabled { get; set; } = true;

        [StringLength(20)]
        public string opt_in_status { get; set; } = "Implicit";

        public DateTime? opted_in_at { get; set; }
        public DateTime? opted_out_at { get; set; }

        [StringLength(100)]
        public string? source { get; set; }

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
