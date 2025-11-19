using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface ISpecialtyService
    {
        Task<IEnumerable<SpecialtyDTO>> GetAllSpecialtiesAsync();
        Task<SpecialtyDTO> GetSpecialtyByIdAsync(Guid id);
        Task<SpecialtyDTO> CreateSpecialtyAsync(SpecialtyDTO specialtyDto);
        Task<SpecialtyDTO> UpdateSpecialtyAsync(Guid id, SpecialtyDTO specialtyDto);
        Task<bool> DeleteSpecialtyAsync(Guid id);
    }
}
