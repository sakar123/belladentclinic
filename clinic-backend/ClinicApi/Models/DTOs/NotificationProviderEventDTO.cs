using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class NotificationProviderEventDTO
    {
        public Guid? id { get; set; }

        [Required]
        public Guid notification_recipient_id { get; set; }

        [StringLength(20)]
        public string provider { get; set; } = "AmazonSES";

        [Required]
        [StringLength(25)]
        public required string event_type { get; set; }

        public DateTime event_time { get; set; }

        public string? payload { get; set; }

        public DateTime created_at { get; set; }
    }
}
