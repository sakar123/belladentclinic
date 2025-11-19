using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IAppointmentService
    {
        Task<IEnumerable<AppointmentDTO>> GetAllAppointmentsAsync();
        Task<AppointmentDTO> GetAppointmentByIdAsync(Guid id);
        Task<AppointmentDTO> CreateAppointmentAsync(AppointmentDTO appointmentDto);
        Task<AppointmentDTO> UpdateAppointmentAsync(Guid id, AppointmentDTO appointmentDto);
        Task<bool> DeleteAppointmentAsync(Guid id);
    }
}
