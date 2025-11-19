using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IToothService
    {
        Task<IEnumerable<ToothDTO>> GetAllTeethAsync();
        Task<ToothDTO> GetToothByIdAsync(Guid id);
        Task<ToothDTO> CreateToothAsync(ToothDTO toothDto);
        Task<ToothDTO> UpdateToothAsync(Guid id, ToothDTO toothDto);
        Task<bool> DeleteToothAsync(Guid id);
    }
}
