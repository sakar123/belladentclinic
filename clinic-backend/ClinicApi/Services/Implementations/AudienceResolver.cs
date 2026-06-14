using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicApi.Services.Implementations
{
    public class AudienceResolver : IAudienceResolver
    {
        private readonly IRepository<Person> _personRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<PersonContactMethod> _contactMethodRepository;
        private readonly IRepository<PersonNotificationPreference> _preferenceRepository;
        private readonly IRepository<PersonChannelSuppression> _suppressionRepository;
        private readonly IRepository<NotificationTopic> _topicRepository;
        private readonly ILogger<AudienceResolver> _logger;

        public AudienceResolver(
            IRepository<Person> personRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IRepository<Appointment> appointmentRepository,
            IRepository<PersonContactMethod> contactMethodRepository,
            IRepository<PersonNotificationPreference> preferenceRepository,
            IRepository<PersonChannelSuppression> suppressionRepository,
            IRepository<NotificationTopic> topicRepository,
            ILogger<AudienceResolver> logger)
        {
            _personRepository = personRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _appointmentRepository = appointmentRepository;
            _contactMethodRepository = contactMethodRepository;
            _preferenceRepository = preferenceRepository;
            _suppressionRepository = suppressionRepository;
            _topicRepository = topicRepository;
            _logger = logger;
        }

        public async Task<AudienceResolutionResult> ResolveAudienceAsync(
            string audienceType, string channel, string topicCode, AudienceFilterCriteria filters)
        {
            var personIds = audienceType.Equals("Patient", StringComparison.OrdinalIgnoreCase)
                ? await ResolvePatientPersonIdsAsync(filters)
                : await ResolveStaffPersonIdsAsync(filters);

            return await ResolvePersonsAsync(personIds, channel, topicCode);
        }

        public async Task<AudienceResolutionResult> ResolvePersonsAsync(
            List<Guid> personIds, string channel, string topicCode)
        {
            var result = new AudienceResolutionResult { matched_count = personIds.Count };

            if (personIds.Count == 0)
                return result;

            // Load persons
            var persons = await _personRepository.GetAll()
                .Where(p => personIds.Contains(p.id))
                .ToListAsync();

            // Load topic for policy
            var topic = await _topicRepository.GetAll()
                .FirstOrDefaultAsync(t => t.code == topicCode);

            // Load active contact methods for channel
            var contactMethods = await _contactMethodRepository.GetAll()
                .Where(cm => personIds.Contains(cm.person_id) && cm.channel == channel && cm.is_active)
                .ToListAsync();
            var contactByPerson = contactMethods
                .GroupBy(cm => cm.person_id)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(cm => cm.is_primary).First());

            // Load preferences for topic
            var preferences = topic != null
                ? await _preferenceRepository.GetAll()
                    .Where(p => personIds.Contains(p.person_id) && p.topic_id == topic.id && p.channel == channel)
                    .ToListAsync()
                : new List<PersonNotificationPreference>();
            var prefByPerson = preferences.ToDictionary(p => p.person_id);

            // Load active suppressions
            var now = DateTime.UtcNow;
            var suppressions = await _suppressionRepository.GetAll()
                .Where(s => personIds.Contains(s.person_id) && s.channel == channel && s.is_active
                    && (s.expires_at == null || s.expires_at > now))
                .ToListAsync();
            var suppressedPersonIds = new HashSet<Guid>(suppressions.Select(s => s.person_id));

            var isMarketing = topic?.category == "Marketing";

            foreach (var person in persons)
            {
                var recipient = new ResolvedRecipient
                {
                    person_id = person.id,
                    name = $"{person.first_name} {person.last_name}".Trim()
                };

                // 1. Check contact method
                if (!contactByPerson.TryGetValue(person.id, out var contact))
                {
                    // Fallback: check person.email / person.phone_number directly
                    if (channel == "Email" && !string.IsNullOrWhiteSpace(person.email))
                    {
                        recipient.contact_value = person.email;
                    }
                    else if (channel == "SMS" && !string.IsNullOrWhiteSpace(person.phone_number))
                    {
                        recipient.contact_value = person.phone_number;
                    }
                    else
                    {
                        recipient.exclusion_reason = "NoActiveContact";
                        result.recipients.Add(recipient);
                        continue;
                    }
                }
                else
                {
                    recipient.contact_value = contact.contact_value;
                    recipient.contact_method_id = contact.id;
                }

                // 2. Check suppression
                if (suppressedPersonIds.Contains(person.id))
                {
                    recipient.exclusion_reason = "Suppressed";
                    result.recipients.Add(recipient);
                    continue;
                }

                // 3. Check preference (marketing requires explicit opt-in or at least not opted out)
                if (isMarketing && prefByPerson.TryGetValue(person.id, out var pref))
                {
                    if (!pref.is_enabled || pref.opt_in_status == "OptedOut")
                    {
                        recipient.exclusion_reason = "OptedOut";
                        result.recipients.Add(recipient);
                        continue;
                    }
                }
                else if (isMarketing && !prefByPerson.ContainsKey(person.id))
                {
                    // Marketing: no preference record means implicit — allow by default
                    // If you want stricter: change this to exclude
                }

                // 4. Check preference disabled (non-marketing topics)
                if (!isMarketing && prefByPerson.TryGetValue(person.id, out var nonMarketingPref))
                {
                    if (!nonMarketingPref.is_enabled)
                    {
                        recipient.exclusion_reason = "PreferenceDisabled";
                        result.recipients.Add(recipient);
                        continue;
                    }
                }

                recipient.is_eligible = true;
                result.recipients.Add(recipient);
            }

            result.eligible_count = result.recipients.Count(r => r.is_eligible);
            result.excluded_count = result.recipients.Count(r => !r.is_eligible);
            result.exclusions = result.recipients
                .Where(r => !r.is_eligible && r.exclusion_reason != null)
                .GroupBy(r => r.exclusion_reason!)
                .ToDictionary(g => g.Key, g => g.Count());

            return result;
        }

        private async Task<List<Guid>> ResolvePatientPersonIdsAsync(AudienceFilterCriteria filters)
        {
            // Start with specific patient IDs if provided
            if (filters.patient_ids != null && filters.patient_ids.Count > 0)
            {
                var patients = await _patientRepository.GetAll()
                    .Where(p => filters.patient_ids.Contains(p.id))
                    .Select(p => p.person_id)
                    .ToListAsync();
                return patients;
            }

            var query = _patientRepository.GetAll()
                .Include(p => p.Person);

            IQueryable<Patient> filtered = query;

            if (filters.has_email == true)
            {
                filtered = filtered.Where(p => p.Person != null && p.Person.email != null && p.Person.email != "");
            }

            if (filters.birthday_month.HasValue)
            {
                filtered = filtered.Where(p =>
                    p.Person != null && p.Person.date_of_birth.HasValue &&
                    p.Person.date_of_birth.Value.Month == filters.birthday_month.Value);
            }

            if (filters.last_appointment_before.HasValue)
            {
                var cutoff = filters.last_appointment_before.Value;
                // Get patient IDs whose last appointment is before the cutoff
                var patientIdsWithRecentAppt = await _appointmentRepository.GetAll()
                    .Where(a => a.appointment_start_time >= cutoff)
                    .Select(a => a.patient_id)
                    .Distinct()
                    .ToListAsync();

                filtered = filtered.Where(p => !patientIdsWithRecentAppt.Contains(p.id));
            }

            if (filters.inactive_since_days.HasValue)
            {
                var cutoff = DateTime.UtcNow.AddDays(-filters.inactive_since_days.Value);
                var activePatientIds = await _appointmentRepository.GetAll()
                    .Where(a => a.appointment_start_time >= cutoff)
                    .Select(a => a.patient_id)
                    .Distinct()
                    .ToListAsync();

                filtered = filtered.Where(p => !activePatientIds.Contains(p.id));
            }

            if (filters.has_upcoming_appointment == true)
            {
                var now = DateTime.UtcNow;
                var upcomingPatientIds = await _appointmentRepository.GetAll()
                    .Where(a => a.appointment_start_time > now)
                    .Select(a => a.patient_id)
                    .Distinct()
                    .ToListAsync();

                filtered = filtered.Where(p => upcomingPatientIds.Contains(p.id));
            }

            if (filters.appointment_between_start.HasValue && filters.appointment_between_end.HasValue)
            {
                var start = filters.appointment_between_start.Value;
                var end = filters.appointment_between_end.Value;
                var patientIdsInRange = await _appointmentRepository.GetAll()
                    .Where(a => a.appointment_start_time >= start && a.appointment_start_time <= end)
                    .Select(a => a.patient_id)
                    .Distinct()
                    .ToListAsync();

                filtered = filtered.Where(p => patientIdsInRange.Contains(p.id));
            }

            return await filtered.Select(p => p.person_id).ToListAsync();
        }

        private async Task<List<Guid>> ResolveStaffPersonIdsAsync(AudienceFilterCriteria filters)
        {
            if (filters.staff_ids != null && filters.staff_ids.Count > 0)
            {
                var staff = await _staffRepository.GetAll()
                    .Where(s => filters.staff_ids.Contains(s.id))
                    .Select(s => s.person_id)
                    .ToListAsync();
                return staff;
            }

            IQueryable<Staff> query = _staffRepository.GetAll();

            if (filters.role_id.HasValue)
                query = query.Where(s => s.role_id == filters.role_id.Value);

            if (filters.specialty_id.HasValue)
                query = query.Where(s => s.specialty_id == filters.specialty_id.Value);

            if (filters.is_active.HasValue)
                query = query.Where(s => s.is_active == filters.is_active.Value);

            if (filters.birthday_month.HasValue)
            {
                query = query.Include(s => s.person)
                    .Where(s => s.person != null && s.person.date_of_birth.HasValue &&
                        s.person.date_of_birth.Value.Month == filters.birthday_month.Value);
            }

            return await query.Select(s => s.person_id).ToListAsync();
        }
    }
}
