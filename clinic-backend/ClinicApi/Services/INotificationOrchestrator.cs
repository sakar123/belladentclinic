using System.Threading.Tasks;
using ClinicApi.Models.DTOs.Notifications;

namespace ClinicApi.Services
{
    /// <summary>
    /// Core notification service. Handles validation, recipient resolution,
    /// preference/suppression checks, deduplication, and record creation.
    /// Does NOT send — leaves records queued for a worker.
    /// </summary>
    public interface INotificationOrchestrator
    {
        /// <summary>
        /// Dispatch a notification for known person_ids (event-driven pattern).
        /// </summary>
        Task<DispatchNotificationResponse> DispatchAsync(DispatchNotificationRequest request);
    }
}
