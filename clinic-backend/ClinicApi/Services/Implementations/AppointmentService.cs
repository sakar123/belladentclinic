using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace ClinicApi.Services.Implementations
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<AppointmentStatus> _statusRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IPatientService _patientService;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            IRepository<Appointment> appointmentRepository,
            IRepository<AppointmentStatus> statusRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IPatientService patientService,
            ILogger<AppointmentService> logger)
        {
            _appointmentRepository = appointmentRepository;
            _statusRepository = statusRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _patientService = patientService;
            _logger = logger;
        }

        public async Task<Appointment> CreateAppointmentFromLandingPageAsync(LandingPageAppointmentRequestDto request)
        {
            _logger.LogInformation("Starting appointment creation process from landing page for {FullName}", request.FullName);

            // 1. Find or create the patient entity
            var patientEntity = await _patientService.FindOrCreatePatientFromLandingPageAsync(request);
            if (patientEntity == null)
            {
                // This should not happen based on the implementation of FindOrCreate, but as a safeguard:
                _logger.LogError("Failed to find or create a patient for email {Email}", request.Email);
                throw new InvalidOperationException("Could not find or create a patient.");
            }
             _logger.LogInformation("Using patient with ID {PatientId} for appointment", patientEntity.id);

            // 2. Get default values for Staff and Status
            var defaultStaff = (await _staffRepository.GetAllAsync()).FirstOrDefault();
            if (defaultStaff == null)
            {
                _logger.LogError("Cannot create appointment. No staff members found in the database.");
                throw new InvalidOperationException("No staff available to assign the appointment to.");
            }
            _logger.LogInformation("Assigning appointment to default staff member with ID {StaffId}", defaultStaff.id);

            var pendingStatus = (await _statusRepository.FindAsync(s => s.name.ToLower() == "pending")).FirstOrDefault();
            if (pendingStatus == null)
            {
                pendingStatus = (await _statusRepository.GetAllAsync()).FirstOrDefault();
                if (pendingStatus == null)
                {
                    _logger.LogError("Cannot create appointment. No appointment statuses found in the database.");
                    throw new InvalidOperationException("No appointment status available to assign.");
                }
            }
            _logger.LogInformation("Setting appointment status to '{StatusName}' with ID {StatusId}", pendingStatus.name, pendingStatus.id);

            // 3. Parse date and time
            if (!DateTime.TryParse($"{request.Date} {request.Time}", out var appointmentDateTime))
            {
                _logger.LogError("Could not parse date/time: {Date} {Time}", request.Date, request.Time);
                throw new ArgumentException("The provided date or time format is invalid.");
            }

            // 4. Create the appointment entity, satisfying 'required' properties
            var newAppointment = new Appointment
            {
                id = Guid.NewGuid(),
                appointment_start_time = appointmentDateTime.ToUniversalTime(),
                duration_minutes = 30, // Default duration
                reason_for_visit = request.Message,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                
                // Set Foreign Keys
                patient_id = patientEntity.id,
                staff_id = defaultStaff.id,
                status_id = pendingStatus.id,

                // Set Required Navigation Properties
                patient = patientEntity,
                staff = defaultStaff,
                status = pendingStatus,
                treatments = new List<Treatment>()
            };

            // 5. Save and return
            await _appointmentRepository.AddAsync(newAppointment);
            await _appointmentRepository.SaveChangesAsync();

            _logger.LogInformation("Successfully created new appointment with ID {AppointmentId} for Patient {PatientId}", newAppointment.id, newAppointment.patient_id);

            return newAppointment;
        }

        public async Task<IEnumerable<AppointmentDTO>> GetAllAppointmentsAsync()
        {
            var appointments = await _appointmentRepository.GetAllAsync();
            return appointments.Select(a => a.ToDto()).ToList();
        }

        public async Task<AppointmentDTO> GetAppointmentByIdAsync(Guid id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            return appointment?.ToDto();
        }

        public async Task<AppointmentDTO> CreateAppointmentAsync(AppointmentDTO appointmentDto)
        {
            if (!await _patientRepository.ExistsAsync(appointmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");
            if (!await _staffRepository.ExistsAsync(appointmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");
            if (!await _statusRepository.ExistsAsync(appointmentDto.status_id))
                throw new KeyNotFoundException("Appointment status not found");

            var appointment = appointmentDto.ToEntity();
            await _appointmentRepository.AddAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();
            
            return appointment.ToDto();
        }

        public async Task<AppointmentDTO> UpdateAppointmentAsync(Guid id, AppointmentDTO appointmentDto)
        {
            var existingAppointment = await _appointmentRepository.GetByIdAsync(id);
            if (existingAppointment == null)
                throw new KeyNotFoundException("Appointment not found");

            if (existingAppointment.patient_id != appointmentDto.patient_id && !await _patientRepository.ExistsAsync(appointmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");
            if (existingAppointment.staff_id != appointmentDto.staff_id && !await _staffRepository.ExistsAsync(appointmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");
            if (existingAppointment.status_id != appointmentDto.status_id && !await _statusRepository.ExistsAsync(appointmentDto.status_id))
                throw new KeyNotFoundException("Appointment status not found");

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
                throw new InvalidOperationException("Cannot delete appointment because there are dependent records (e.g., treatments or documents). Remove or reassign dependent records first.");
            }
            return true;
        }
    }
}
