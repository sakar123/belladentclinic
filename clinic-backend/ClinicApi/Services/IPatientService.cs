using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
namespace ClinicApi.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientDTO>> GetAllPatientsAsync();
        Task<PatientDTO> GetPatientByIdAsync(Guid id);
        Task<PatientDTO> CreatePatientAsync(PatientDTO patientDto);
        Task<PatientDTO> UpdatePatientAsync(Guid id, PatientDTO patientDto);
        Task<bool> DeletePatientAsync(Guid id);
    }
}