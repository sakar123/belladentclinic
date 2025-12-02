using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientDTO>> GetAllPatientsAsync();
        Task<PatientDTO> GetPatientByIdAsync(Guid id);
        Task<Patient> FindOrCreatePatientFromLandingPageAsync(LandingPageAppointmentRequestDto request);
        Task<PatientDTO> CreatePatientAsync(PatientDTO patientDto);
        Task<PatientDTO> UpdatePatientAsync(Guid id, PatientDTO patientDto);
        Task<bool> DeletePatientAsync(Guid id);
    }
}