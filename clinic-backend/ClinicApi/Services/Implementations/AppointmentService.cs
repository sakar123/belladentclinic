using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;
using ClinicApi.Mappers;

namespace ClinicApi.Services.Implementations
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<AppointmentStatus> _statusRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;

        public AppointmentService(
            IRepository<Appointment> appointmentRepository,
            IRepository<AppointmentStatus> statusRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository
            )
        {
            _appointmentRepository = appointmentRepository;
            _statusRepository = statusRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
        }

        public async Task<IEnumerable<AppointmentDTO>> GetAllAppointmentsAsync()
        {
            var appointments = await _appointmentRepository.GetAllAsync();
            // Select projects each entity to its DTO, then return the resulting list.
            return appointments.Select(a => a.ToDto()).ToList();
        }

        
    
        public async Task<AppointmentDTO> GetAppointmentByIdAsync(Guid id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            // Use the ToDto() extension method, and handle the case where the appointment isn't found.
            return appointment?.ToDto();
        }

        public async Task<AppointmentDTO> CreateAppointmentAsync(AppointmentDTO appointmentDto)
        {
            // Validate related entities exist
            if (!await _patientRepository.ExistsAsync(appointmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");
                
            if (!await _staffRepository.ExistsAsync(appointmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");
                
            if (!await _statusRepository.ExistsAsync(appointmentDto.status_id))
                throw new KeyNotFoundException("Appointment status not found");

            // Use the ToEntity() extension method
            var appointment = appointmentDto.ToEntity();
            await _appointmentRepository.AddAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();
            
            // Use the ToDto() extension method
            return appointment.ToDto();
        }

        public async Task<AppointmentDTO> UpdateAppointmentAsync(Guid id, AppointmentDTO appointmentDto)
        {
            var existingAppointment = await _appointmentRepository.GetByIdAsync(id);
            if (existingAppointment == null)
                throw new KeyNotFoundException("Appointment not found");

            // Validate related entities exist
            if (existingAppointment.patient_id != appointmentDto.patient_id && !await _patientRepository.ExistsAsync(appointmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");
                
            if (existingAppointment.staff_id != appointmentDto.staff_id && !await _staffRepository.ExistsAsync(appointmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");
                
            if (existingAppointment.status_id != appointmentDto.status_id && !await _statusRepository.ExistsAsync(appointmentDto.status_id))
                throw new KeyNotFoundException("Appointment status not found");

            // Manually update properties on the existing, tracked entity
            existingAppointment.patient_id = appointmentDto.patient_id;
            existingAppointment.staff_id = appointmentDto.staff_id;
            existingAppointment.status_id = appointmentDto.status_id;
            existingAppointment.appointment_start_time = appointmentDto.appointment_start_time;
            existingAppointment.duration_minutes = appointmentDto.duration_minutes;
            existingAppointment.reason_for_visit = appointmentDto.reason_for_visit;
            existingAppointment.notes = appointmentDto.notes;
            existingAppointment.updated_at = DateTime.UtcNow;
            
            _appointmentRepository.Update(existingAppointment);
            await _appointmentRepository.SaveChangesAsync();
            
            return existingAppointment.ToDto();
        }

        public async Task<bool> DeleteAppointmentAsync(Guid id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                return false;

            try
            {
                _appointmentRepository.Delete(appointment);
                await _appointmentRepository.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Translate FK violation (e.g., treatments referencing this appointment)
                // into a meaningful message the controller can return as 409.
                throw new InvalidOperationException("Cannot delete appointment because there are dependent records (e.g., treatments or documents). Remove or reassign dependent records first.");
            }
            return true;
        }
    }
}
