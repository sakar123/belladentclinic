using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesAsync();
        Task<ServiceDTO> GetServiceByIdAsync(Guid id);
        Task<ServiceDTO> CreateServiceAsync(ServiceDTO serviceDto);
        Task<ServiceDTO> UpdateServiceAsync(Guid id, ServiceDTO serviceDto);
        Task<bool> DeleteServiceAsync(Guid id);
    }
}
