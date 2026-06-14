using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationTopicDTO
    {
        public Guid? id { get; set; }

        [Required]
        [StringLength(50)]
        public required string code { get; set; }

        [Required]
        [StringLength(100)]
        public required string name { get; set; }

        public string? description { get; set; }

        [Required]
        [StringLength(25)]
        public required string category { get; set; }

        [StringLength(10)]
        public string audience_scope { get; set; } = "Any";

        public bool is_active { get; set; } = true;

        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
