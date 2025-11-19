using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IPrescriptionService
    {
        Task<IEnumerable<PrescriptionDTO>> GetAllPrescriptionsAsync();
        Task<PrescriptionDTO> GetPrescriptionByIdAsync(Guid id);
        Task<PrescriptionDTO> CreatePrescriptionAsync(PrescriptionDTO prescriptionDto);
        Task<PrescriptionDTO> UpdatePrescriptionAsync(Guid id, PrescriptionDTO prescriptionDto);
        Task<bool> DeletePrescriptionAsync(Guid id);
    }
}
