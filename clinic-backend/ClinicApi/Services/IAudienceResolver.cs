using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs.Notifications;

namespace ClinicApi.Services
{
    /// <summary>
    /// Resolves structured filter criteria to person lists with eligibility info.
    /// </summary>
    public interface IAudienceResolver
    {
        /// <summary>
        /// Resolve audience from filter criteria. Returns all matched persons with eligibility status.
        /// </summary>
        Task<AudienceResolutionResult> ResolveAudienceAsync(
            string audienceType,
            string channel,
            string topicCode,
            AudienceFilterCriteria filters);

        /// <summary>
        /// Resolve eligibility for a specific list of person IDs.
        /// Used by dispatch endpoint when person_ids are already known.
        /// </summary>
        Task<AudienceResolutionResult> ResolvePersonsAsync(
            List<Guid> personIds,
            string channel,
            string topicCode);
    }

    public class AudienceResolutionResult
    {
        public List<ResolvedRecipient> recipients { get; set; } = new();
        public int matched_count { get; set; }
        public int eligible_count { get; set; }
        public int excluded_count { get; set; }
        public Dictionary<string, int> exclusions { get; set; } = new();
    }

    public class ResolvedRecipient
    {
        public Guid person_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? contact_value { get; set; }
        public Guid? contact_method_id { get; set; }
        public bool is_eligible { get; set; }
        public string? exclusion_reason { get; set; } // NoActiveContact, OptedOut, Suppressed, PreferenceDisabled
    }
}
