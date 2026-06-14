using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicApi.Services.Implementations
{
    public class CampaignManager : ICampaignManager
    {
        private readonly IRepository<NotificationCampaign> _campaignRepository;
        private readonly IRepository<NotificationTopic> _topicRepository;
        private readonly IRepository<NotificationTemplate> _templateRepository;
        private readonly IRepository<Notification> _notificationRepository;
        private readonly IRepository<NotificationRecipient> _recipientRepository;
        private readonly IAudienceResolver _audienceResolver;
        private readonly INotificationOrchestrator _orchestrator;
        private readonly ILogger<CampaignManager> _logger;

        private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

        public CampaignManager(
            IRepository<NotificationCampaign> campaignRepository,
            IRepository<NotificationTopic> topicRepository,
            IRepository<NotificationTemplate> templateRepository,
            IRepository<Notification> notificationRepository,
            IRepository<NotificationRecipient> recipientRepository,
            IAudienceResolver audienceResolver,
            INotificationOrchestrator orchestrator,
            ILogger<CampaignManager> logger)
        {
            _campaignRepository = campaignRepository;
            _topicRepository = topicRepository;
            _templateRepository = templateRepository;
            _notificationRepository = notificationRepository;
            _recipientRepository = recipientRepository;
            _audienceResolver = audienceResolver;
            _orchestrator = orchestrator;
            _logger = logger;
        }

        public async Task<CampaignPreviewResponse> PreviewAsync(CampaignPreviewRequest request)
        {
            var resolution = await _audienceResolver.ResolveAudienceAsync(
                request.audience_type, request.channel, request.topic_code, request.filters);

            var sample = resolution.recipients
                .Take(20)
                .Select(r => new PreviewRecipient
                {
                    person_id = r.person_id,
                    name = r.name,
                    contact = r.contact_value,
                    status = r.is_eligible ? "Eligible" : (r.exclusion_reason ?? "Excluded")
                })
                .ToList();

            return new CampaignPreviewResponse
            {
                matched_count = resolution.matched_count,
                eligible_count = resolution.eligible_count,
                excluded_count = resolution.excluded_count,
                exclusions = resolution.exclusions,
                sample = sample
            };
        }

        public async Task<CreateCampaignResponse> CreateAsync(CreateCampaignRequest request)
        {
            // Validate topic
            var topic = await _topicRepository.GetAll()
                .FirstOrDefaultAsync(t => t.code == request.topic_code);
            if (topic == null)
                throw new KeyNotFoundException($"NotificationTopic with code '{request.topic_code}' not found");

            // Validate template (optional)
            NotificationTemplate? template = null;
            if (!string.IsNullOrEmpty(request.template_code))
            {
                template = await _templateRepository.GetAll()
                    .FirstOrDefaultAsync(t => t.code == request.template_code);
                if (template == null)
                    throw new KeyNotFoundException($"NotificationTemplate with code '{request.template_code}' not found");
            }

            var status = request.scheduled_at.HasValue ? "Scheduled" : "Draft";

            var campaign = new NotificationCampaign
            {
                id = Guid.NewGuid(),
                name = request.name,
                topic_id = topic.id,
                template_id = template?.id,
                channel = request.channel,
                audience_scope = request.audience_type,
                status = status,
                scheduled_at = request.scheduled_at,
                filter_criteria_json = JsonSerializer.Serialize(request.filters, JsonOptions),
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                created_by = request.initiated_by
            };

            await _campaignRepository.AddAsync(campaign);
            await _campaignRepository.SaveChangesAsync();

            _logger.LogInformation("Created campaign {CampaignId} with name {Name}, status={Status}", campaign.id, campaign.name, status);

            return new CreateCampaignResponse
            {
                campaign_id = campaign.id,
                status = status
            };
        }

        public async Task<DispatchNotificationResponse> LaunchAsync(Guid campaignId)
        {
            var campaign = await _campaignRepository.GetAll()
                .Include(c => c.topic)
                .Include(c => c.template)
                .FirstOrDefaultAsync(c => c.id == campaignId);

            if (campaign == null)
                throw new KeyNotFoundException("Campaign not found");

            if (campaign.status != "Draft" && campaign.status != "Scheduled")
                throw new InvalidOperationException($"Campaign cannot be launched from status '{campaign.status}'");

            // Deserialize saved filter criteria
            var filters = !string.IsNullOrEmpty(campaign.filter_criteria_json)
                ? JsonSerializer.Deserialize<AudienceFilterCriteria>(campaign.filter_criteria_json, JsonOptions)
                  ?? new AudienceFilterCriteria()
                : new AudienceFilterCriteria();

            // Resolve audience
            var resolution = await _audienceResolver.ResolveAudienceAsync(
                campaign.audience_scope, campaign.channel, campaign.topic!.code, filters);

            var eligiblePersonIds = resolution.recipients
                .Where(r => r.is_eligible)
                .Select(r => r.person_id)
                .ToList();

            // Mark campaign as Running
            campaign.status = "Running";
            campaign.launched_at = DateTime.UtcNow;
            campaign.updated_at = DateTime.UtcNow;
            await _campaignRepository.UpdateAsync(campaign);
            await _campaignRepository.SaveChangesAsync();

            if (eligiblePersonIds.Count == 0)
            {
                campaign.status = "Completed";
                campaign.completed_at = DateTime.UtcNow;
                campaign.updated_at = DateTime.UtcNow;
                await _campaignRepository.UpdateAsync(campaign);
                await _campaignRepository.SaveChangesAsync();

                return new DispatchNotificationResponse
                {
                    requested_count = resolution.matched_count,
                    eligible_count = 0,
                    excluded_count = resolution.excluded_count,
                    status = "Completed",
                    exclusions = resolution.exclusions.Count > 0 ? resolution.exclusions : null
                };
            }

            // Dispatch through orchestrator
            var dispatchRequest = new DispatchNotificationRequest
            {
                topic_code = campaign.topic!.code,
                channel = campaign.channel,
                person_ids = eligiblePersonIds,
                template_code = campaign.template?.code,
                campaign_id = campaign.id,
                idempotency_key = $"campaign-launch-{campaign.id}",
                initiated_by = campaign.created_by
            };

            var result = await _orchestrator.DispatchAsync(dispatchRequest);

            _logger.LogInformation("Launched campaign {CampaignId}: {Eligible} eligible, {Excluded} excluded",
                campaignId, result.eligible_count, result.excluded_count);

            return result;
        }

        public async Task<CampaignDetailResponse> GetAsync(Guid campaignId)
        {
            var campaign = await _campaignRepository.GetAll()
                .Include(c => c.topic)
                .Include(c => c.template)
                .FirstOrDefaultAsync(c => c.id == campaignId);

            if (campaign == null)
                throw new KeyNotFoundException("Campaign not found");

            return new CampaignDetailResponse
            {
                id = campaign.id,
                name = campaign.name,
                status = campaign.status,
                topic_code = campaign.topic?.code ?? "",
                channel = campaign.channel,
                audience_type = campaign.audience_scope,
                template_code = campaign.template?.code,
                scheduled_at = campaign.scheduled_at,
                launched_at = campaign.launched_at,
                completed_at = campaign.completed_at,
                description = campaign.description,
                created_by = campaign.created_by,
                created_at = campaign.created_at
            };
        }

        public async Task<CampaignStatsResponse> GetStatsAsync(Guid campaignId)
        {
            var campaign = await _campaignRepository.GetByIdAsync(campaignId);
            if (campaign == null)
                throw new KeyNotFoundException("Campaign not found");

            // Get all notifications for this campaign
            var notifications = await _notificationRepository.GetAll()
                .Where(n => n.campaign_id == campaignId)
                .Select(n => n.id)
                .ToListAsync();

            // Get all recipients for those notifications
            var recipients = await _recipientRepository.GetAll()
                .Where(r => notifications.Contains(r.notification_id))
                .ToListAsync();

            var targeted = recipients.Count;
            var eligible = recipients.Count(r => r.delivery_status != "Suppressed");
            var excluded = recipients.Count(r => r.delivery_status == "Suppressed");

            return new CampaignStatsResponse
            {
                campaign_id = campaignId,
                status = campaign.status,
                targeted = targeted,
                eligible = eligible,
                excluded = excluded,
                queued = recipients.Count(r => r.delivery_status == "Queued"),
                sent = recipients.Count(r => r.delivery_status == "Sent"),
                delivered = recipients.Count(r => r.delivery_status == "Delivered"),
                bounced = recipients.Count(r => r.delivery_status == "Bounced"),
                complained = recipients.Count(r => r.delivery_status == "Complained"),
                opened = recipients.Count(r => r.delivery_status == "Opened"),
                clicked = recipients.Count(r => r.delivery_status == "Clicked"),
                failed = recipients.Count(r => r.delivery_status == "Failed")
            };
        }
    }
}
