using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
namespace ClinicApi.Services
{
    public interface IStaffService
    {
        Task<IEnumerable<StaffDTO>> GetAllStaffAsync();
        Task<StaffDTO> GetStaffByIdAsync(Guid id);
        Task<StaffDTO> CreateStaffAsync(StaffDTO staffDto);
        Task<StaffDTO> UpdateStaffAsync(Guid id, StaffDTO staffDto);
        Task<bool> DeleteStaffAsync(Guid id);
    }
}