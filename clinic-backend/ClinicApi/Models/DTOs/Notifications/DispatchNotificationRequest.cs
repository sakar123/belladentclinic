using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class DispatchNotificationRequest
    {
        [Required]
        public required string topic_code { get; set; }

        [Required]
        public required string channel { get; set; } // Email, SMS

        [Required]
        [MinLength(1)]
        public required List<Guid> person_ids { get; set; }

        public Guid? appointment_id { get; set; }

        public string? template_code { get; set; }

        public Guid? campaign_id { get; set; }

        public DateTime? scheduled_for { get; set; }

        /// <summary>
        /// Prevents duplicate notifications for the same logical event.
        /// Examples: "appt-confirm-{appointmentId}", "appt-reminder-{appointmentId}-24h"
        /// </summary>
        public string? idempotency_key { get; set; }

        /// <summary>
        /// Merge data for template rendering (appointment_date, clinic_phone, etc.)
        /// </summary>
        public Dictionary<string, string>? payload { get; set; }

        /// <summary>
        /// Who initiated this notification (e.g. "system", "frontdesk.user")
        /// </summary>
        public string? initiated_by { get; set; }
    }
}
