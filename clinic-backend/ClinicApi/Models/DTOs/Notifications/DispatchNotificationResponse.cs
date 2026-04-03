using System;
using System.Collections.Generic;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class DispatchNotificationResponse
    {
        public Guid? notification_id { get; set; }
        public int requested_count { get; set; }
        public int eligible_count { get; set; }
        public int excluded_count { get; set; }
        public string status { get; set; } = "Queued";

        /// <summary>
        /// Breakdown of exclusion reasons: { "NoActiveContact": 7, "OptedOut": 6, "Suppressed": 5 }
        /// </summary>
        public Dictionary<string, int>? exclusions { get; set; }
    }
}
