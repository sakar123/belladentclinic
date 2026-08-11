using System;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IOdontogramSnapshotService
    {
        Task<OdontogramSnapshotDTO?> GetLatestAsync(Guid patientId);
        Task<OdontogramSnapshotDTO> UpsertAsync(Guid patientId, SaveOdontogramSnapshotRequest request);
    }
}
