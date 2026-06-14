using System;
using System.Collections.Generic;

namespace ClinicApi.Models.DTOs.Notifications
{
    /// <summary>
    /// Structured filter criteria for resolving notification audiences.
    /// Backend owns filter translation. Frontend sends structured filter objects.
    /// </summary>
    public class AudienceFilterCriteria
    {
        // --- Patient filters ---
        public bool? has_email { get; set; }
        public bool? marketing_enabled { get; set; }
        public DateTime? appointment_between_start { get; set; }
        public DateTime? appointment_between_end { get; set; }
        public DateTime? last_appointment_before { get; set; }
        public int? birthday_month { get; set; }
        public bool? has_upcoming_appointment { get; set; }
        public int? inactive_since_days { get; set; }
        public List<Guid>? patient_ids { get; set; }

        // --- Staff filters ---
        public Guid? role_id { get; set; }
        public Guid? specialty_id { get; set; }
        public bool? is_active { get; set; }
        public List<Guid>? staff_ids { get; set; }
    }
}
