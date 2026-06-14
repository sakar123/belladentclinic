using System;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IPerioService
    {
        Task<PerioStatusDTO?> GetLatestAsync(Guid patientId);
        Task<PerioStatusDTO> CreateAsync(CreatePerioRequest request);
        Task<PerioStatisticsDTO> GetStatisticsAsync(Guid patientId);
    }
}
