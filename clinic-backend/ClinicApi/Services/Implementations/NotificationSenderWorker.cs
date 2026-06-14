using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Models.AppSettings;
using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ClinicApi.Services.Implementations
{
    public class NotificationSenderWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationSenderWorker> _logger;
        private readonly NotificationWorkerSettings _settings;

        public NotificationSenderWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<NotificationSenderWorker> logger,
            IOptions<NotificationWorkerSettings> settings)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _settings = settings.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("NotificationSenderWorker started. Polling every {Interval}s, batch size {BatchSize}",
                _settings.PollingIntervalSeconds, _settings.BatchSize);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBatchAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Unhandled error in NotificationSenderWorker poll loop");
                }

                await Task.Delay(TimeSpan.FromSeconds(_settings.PollingIntervalSeconds), stoppingToken);
            }

            _logger.LogInformation("NotificationSenderWorker stopping");
        }

        private async Task ProcessBatchAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DentalClinicContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Fetch queued recipients whose parent notification is also Queued (or Processing)
            var recipients = await db.NotificationRecipient
                .Include(r => r.notification)
                .Where(r => r.delivery_status == "Queued"
                    && r.notification != null
                    && (r.notification.status == "Queued" || r.notification.status == "Processing")
                    && (r.notification.scheduled_for == null || r.notification.scheduled_for <= DateTime.UtcNow))
                .OrderBy(r => r.created_at)
                .Take(_settings.BatchSize)
                .ToListAsync(ct);

            if (recipients.Count == 0)
                return;

            _logger.LogInformation("NotificationSenderWorker processing {Count} queued recipients", recipients.Count);

            // Track which notifications we touched so we can update their aggregate status
            var touchedNotificationIds = new HashSet<Guid>();

            foreach (var recipient in recipients)
            {
                ct.ThrowIfCancellationRequested();

                var notification = recipient.notification!;
                touchedNotificationIds.Add(notification.id);

                // Mark processing
                if (notification.status == "Queued")
                {
                    notification.status = "Processing";
                    notification.updated_at = DateTime.UtcNow;
                }

                // Only Email channel is supported right now
                if (!string.Equals(notification.channel, "Email", StringComparison.OrdinalIgnoreCase))
                {
                    recipient.delivery_status = "Failed";
                    recipient.failure_reason = $"Unsupported channel: {notification.channel}";
                    recipient.failed_at = DateTime.UtcNow;
                    recipient.updated_at = DateTime.UtcNow;
                    continue;
                }

                if (string.IsNullOrWhiteSpace(recipient.recipient_address))
                {
                    recipient.delivery_status = "Failed";
                    recipient.failure_reason = "No recipient address";
                    recipient.failed_at = DateTime.UtcNow;
                    recipient.updated_at = DateTime.UtcNow;
                    continue;
                }

                var subject = notification.subject_rendered ?? "(No Subject)";
                var htmlBody = notification.body_rendered_html ?? notification.body_rendered_text ?? "";

                var result = await emailService.TrySendEmailAsync(
                    recipient.recipient_address,
                    subject,
                    htmlBody,
                    notification.body_rendered_text);

                if (result.Success)
                {
                    recipient.delivery_status = "Sent";
                    recipient.sent_at = DateTime.UtcNow;
                    recipient.provider_message_id = result.MessageId;
                    _logger.LogInformation("Sent email to {Address} for notification {NotificationId}",
                        recipient.recipient_address, notification.id);
                }
                else
                {
                    recipient.delivery_status = "Failed";
                    recipient.failed_at = DateTime.UtcNow;
                    recipient.failure_reason = result.ErrorMessage;
                    _logger.LogWarning("Failed to send email to {Address} for notification {NotificationId}: {Error}",
                        recipient.recipient_address, notification.id, result.ErrorMessage);
                }
                recipient.updated_at = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);

            // Update aggregate notification statuses
            foreach (var notificationId in touchedNotificationIds)
            {
                await UpdateNotificationStatusAsync(db, notificationId, ct);
            }
        }

        private static async Task UpdateNotificationStatusAsync(DentalClinicContext db, Guid notificationId, CancellationToken ct)
        {
            var notification = await db.Notification
                .Include(n => n.recipients)
                .FirstOrDefaultAsync(n => n.id == notificationId, ct);

            if (notification == null) return;

            var allRecipients = notification.recipients
                .Where(r => r.delivery_status != "Suppressed")
                .ToList();

            // If any are still queued/processing, don't finalize yet
            if (allRecipients.Any(r => r.delivery_status == "Queued" || r.delivery_status == "Processing"))
                return;

            var sentCount = allRecipients.Count(r => r.delivery_status == "Sent" || r.delivery_status == "Delivered");
            var failedCount = allRecipients.Count(r => r.delivery_status == "Failed");

            if (failedCount == 0 && sentCount > 0)
            {
                notification.status = "Sent";
            }
            else if (sentCount == 0 && failedCount > 0)
            {
                notification.status = "Failed";
                notification.error_message = $"All {failedCount} recipient(s) failed";
            }
            else if (sentCount > 0 && failedCount > 0)
            {
                notification.status = "Partial";
                notification.error_message = $"{failedCount} of {sentCount + failedCount} recipient(s) failed";
            }
            else
            {
                // Edge case: no non-suppressed recipients (all were suppressed)
                notification.status = "Cancelled";
            }

            notification.processed_at = DateTime.UtcNow;
            notification.updated_at = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }
    }
}
