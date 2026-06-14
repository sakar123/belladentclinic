using System;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs.Notifications;

namespace ClinicApi.Services
{
    /// <summary>
    /// Campaign lifecycle: preview, create, launch, get, stats.
    /// </summary>
    public interface ICampaignManager
    {
        Task<CampaignPreviewResponse> PreviewAsync(CampaignPreviewRequest request);
        Task<CreateCampaignResponse> CreateAsync(CreateCampaignRequest request);
        Task<DispatchNotificationResponse> LaunchAsync(Guid campaignId);
        Task<CampaignDetailResponse> GetAsync(Guid campaignId);
        Task<CampaignStatsResponse> GetStatsAsync(Guid campaignId);
    }
}
