using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface ITreatmentService
    {
        Task<IEnumerable<TreatmentDTO>> GetAllTreatmentsAsync(Guid? patientId = null);
        Task<TreatmentDTO> GetTreatmentByIdAsync(Guid id);
        Task<TreatmentDTO> CreateTreatmentAsync(TreatmentDTO treatmentDto);
        Task<TreatmentDTO> UpdateTreatmentAsync(Guid id, TreatmentDTO treatmentDto);
        Task<bool> DeleteTreatmentAsync(Guid id);
        Task<TreatmentDTO> CompleteTreatmentAsync(Guid id);
        Task<TreatmentDTO> CancelTreatmentAsync(Guid id);
    }
}
