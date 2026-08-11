using System;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IAdvancedOdontogramService
    {
        Task<AdvancedOdontogramStateDTO> GetStateAsync(Guid patientId);
        Task<AdvancedOdontogramStateDTO> SaveStateAsync(Guid patientId, SaveAdvancedOdontogramStateRequest request, string? ifMatch, string? userKey);
        Task<AdvancedOdontogramStateDTO> CommitPlanAsync(Guid patientId, CommitOdontogramPlanRequest request, string? userKey);
        Task<OdontogramPlanItemDTO> DismissPlanItemAsync(Guid patientId, Guid planItemId, string? userKey);
    }
}
