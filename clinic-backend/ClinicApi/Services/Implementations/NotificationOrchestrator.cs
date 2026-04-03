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
    public class NotificationOrchestrator : INotificationOrchestrator
    {
        private readonly IRepository<NotificationTopic> _topicRepository;
        private readonly IRepository<NotificationTemplate> _templateRepository;
        private readonly IRepository<Notification> _notificationRepository;
        private readonly IRepository<NotificationRecipient> _recipientRepository;
        private readonly IAudienceResolver _audienceResolver;
        private readonly ILogger<NotificationOrchestrator> _logger;

        public NotificationOrchestrator(
            IRepository<NotificationTopic> topicRepository,
            IRepository<NotificationTemplate> templateRepository,
            IRepository<Notification> notificationRepository,
            IRepository<NotificationRecipient> recipientRepository,
            IAudienceResolver audienceResolver,
            ILogger<NotificationOrchestrator> logger)
        {
            _topicRepository = topicRepository;
            _templateRepository = templateRepository;
            _notificationRepository = notificationRepository;
            _recipientRepository = recipientRepository;
            _audienceResolver = audienceResolver;
            _logger = logger;
        }

        public async Task<DispatchNotificationResponse> DispatchAsync(DispatchNotificationRequest request)
        {
            // 1. Validate topic
            var topic = await _topicRepository.GetAll()
                .FirstOrDefaultAsync(t => t.code == request.topic_code);
            if (topic == null)
                throw new KeyNotFoundException($"NotificationTopic with code '{request.topic_code}' not found");
            if (!topic.is_active)
                throw new InvalidOperationException($"NotificationTopic '{request.topic_code}' is not active");

            // 2. Resolve template — explicit code wins, otherwise auto-match by topic + channel
            NotificationTemplate? template = null;
            if (!string.IsNullOrEmpty(request.template_code))
            {
                template = await _templateRepository.GetAll()
                    .FirstOrDefaultAsync(t => t.code == request.template_code);
                if (template == null)
                    throw new KeyNotFoundException($"NotificationTemplate with code '{request.template_code}' not found");
            }
            else
            {
                // Auto-resolve: find active template matching topic + channel
                template = await _templateRepository.GetAll()
                    .FirstOrDefaultAsync(t => t.topic_id == topic.id
                        && t.channel == request.channel
                        && t.is_active);
            }

            // 3. Idempotency check
            if (!string.IsNullOrEmpty(request.idempotency_key))
            {
                var existing = await _notificationRepository.GetAll()
                    .Include(n => n.recipients)
                    .FirstOrDefaultAsync(n => n.created_by == request.idempotency_key && n.topic_id == topic.id);

                if (existing != null)
                {
                    _logger.LogInformation("Idempotency hit for key {Key}, returning existing notification {Id}",
                        request.idempotency_key, existing.id);
                    return new DispatchNotificationResponse
                    {
                        notification_id = existing.id,
                        requested_count = request.person_ids.Count,
                        eligible_count = existing.recipients.Count(r => r.delivery_status != "Suppressed"),
                        excluded_count = existing.recipients.Count(r => r.delivery_status == "Suppressed"),
                        status = existing.status
                    };
                }
            }

            // 4. Resolve recipients with preference/suppression checks
            var resolution = await _audienceResolver.ResolvePersonsAsync(
                request.person_ids, request.channel, request.topic_code);

            var eligible = resolution.recipients.Where(r => r.is_eligible).ToList();

            // 5. Render content from template (simple merge for now)
            string? subjectRendered = template?.subject_template;
            string? bodyText = template?.body_text;
            string? bodyHtml = template?.body_html;

            if (request.payload != null && request.payload.Count > 0)
            {
                foreach (var kvp in request.payload)
                {
                    var placeholder = "{{" + kvp.Key + "}}";
                    subjectRendered = subjectRendered?.Replace(placeholder, kvp.Value);
                    bodyText = bodyText?.Replace(placeholder, kvp.Value);
                    bodyHtml = bodyHtml?.Replace(placeholder, kvp.Value);
                }
            }

            // 6. Create notification record
            var notification = new Notification
            {
                id = Guid.NewGuid(),
                topic_id = topic.id,
                template_id = template?.id,
                campaign_id = request.campaign_id,
                appointment_id = request.appointment_id,
                channel = request.channel,
                provider = template?.provider ?? "AmazonSES",
                status = eligible.Count > 0 ? "Queued" : "Cancelled",
                subject_rendered = subjectRendered,
                body_rendered_text = bodyText,
                body_rendered_html = bodyHtml,
                scheduled_for = request.scheduled_for,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                created_by = request.idempotency_key ?? request.initiated_by
            };

            // Set patient_id/staff_id if single recipient
            if (request.person_ids.Count == 1)
            {
                // We don't have direct patient/staff ID here — leave null for now
                // The recipient records carry the person_id
            }

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();

            // 7. Create notification_recipient rows
            foreach (var recipient in resolution.recipients)
            {
                var nr = new NotificationRecipient
                {
                    id = Guid.NewGuid(),
                    notification_id = notification.id,
                    person_id = recipient.person_id,
                    contact_method_id = recipient.contact_method_id,
                    recipient_address = recipient.contact_value ?? "",
                    recipient_type = "Primary",
                    delivery_status = recipient.is_eligible ? "Queued" : "Suppressed",
                    failure_reason = recipient.exclusion_reason,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow,
                    created_by = request.initiated_by
                };
                await _recipientRepository.AddAsync(nr);
            }
            await _recipientRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Dispatched notification {NotificationId}: {Eligible} eligible, {Excluded} excluded, topic={TopicCode}, channel={Channel}",
                notification.id, eligible.Count, resolution.excluded_count, request.topic_code, request.channel);

            return new DispatchNotificationResponse
            {
                notification_id = notification.id,
                requested_count = resolution.matched_count,
                eligible_count = resolution.eligible_count,
                excluded_count = resolution.excluded_count,
                status = notification.status,
                exclusions = resolution.exclusions.Count > 0 ? resolution.exclusions : null
            };
        }
    }
}
