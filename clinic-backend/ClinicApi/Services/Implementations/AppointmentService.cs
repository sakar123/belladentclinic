using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Npgsql;
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
        private readonly INotificationOrchestrator _notificationOrchestrator;

        public AppointmentService(
            IRepository<Appointment> appointmentRepository,
            IRepository<AppointmentStatus> statusRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IPatientService patientService,
            ILogger<AppointmentService> logger,
            INotificationOrchestrator notificationOrchestrator)
        {
            _appointmentRepository = appointmentRepository;
            _statusRepository = statusRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _patientService = patientService;
            _logger = logger;
            _notificationOrchestrator = notificationOrchestrator;
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
            try
            {
                await _appointmentRepository.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                var baseEx = ex.GetBaseException();
                if (baseEx is PostgresException pg)
                {
                    _logger.LogError(ex,
                        "Postgres error during SaveChanges for LandingPage appointment create. SqlState={SqlState}, MessageText='{MessageText}', Hint='{Hint}', Detail='{Detail}', Schema='{Schema}', Table='{Table}', Column='{Column}', DataType='{DataType}', Constraint='{Constraint}', Position={Position}. PatientId={PatientId}, StaffId={StaffId}, StatusId={StatusId}, Date='{Date}', Time='{Time}', ParsedDateTimeUtc='{ParsedUtc}'",
                        pg.SqlState,
                        pg.MessageText,
                        pg.Hint,
                        pg.Detail,
                        pg.SchemaName,
                        pg.TableName,
                        pg.ColumnName,
                        pg.DataTypeName,
                        pg.ConstraintName,
                        pg.Position,
                        newAppointment.patient_id,
                        newAppointment.staff_id,
                        newAppointment.status_id,
                        request.Date,
                        request.Time,
                        newAppointment.appointment_start_time);
                }
                else
                {
                    _logger.LogError(ex,
                        "DbUpdateException during SaveChanges for LandingPage appointment create. PatientId={PatientId}, StaffId={StaffId}, StatusId={StatusId}, Date='{Date}', Time='{Time}', ParsedDateTimeUtc='{ParsedUtc}'",
                        newAppointment.patient_id,
                        newAppointment.staff_id,
                        newAppointment.status_id,
                        request.Date,
                        request.Time,
                        newAppointment.appointment_start_time);
                }
                throw;
            }

            _logger.LogInformation("Successfully created new appointment with ID {AppointmentId} for Patient {PatientId}", newAppointment.id, newAppointment.patient_id);

            // Dispatch appointment confirmation via notification system
            await DispatchAppointmentNotificationAsync(
                "APPOINTMENT_CONFIRMATION",
                patientEntity.person_id,
                newAppointment);

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
            var patient = await _patientRepository.GetAll().Include(p => p.Person).FirstOrDefaultAsync(p => p.id == appointmentDto.patient_id);
            if (patient == null)
                throw new KeyNotFoundException("Patient not found");
            if (!await _staffRepository.ExistsAsync(appointmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");
            if (!await _statusRepository.ExistsAsync(appointmentDto.status_id))
                throw new KeyNotFoundException("Appointment status not found");

            var appointment = appointmentDto.ToEntity();

            await _appointmentRepository.AddAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();

            // Dispatch appointment confirmation via notification system
            await DispatchAppointmentNotificationAsync(
                "APPOINTMENT_CONFIRMATION",
                patient.person_id,
                appointment);

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
            
            await _appointmentRepository.UpdateAsync(existingAppointment);
            await _appointmentRepository.SaveChangesAsync();

            // Dispatch appointment updated notification
            var patient = await _patientRepository.GetByIdAsync(existingAppointment.patient_id);
            if (patient != null)
            {
                await DispatchAppointmentNotificationAsync(
                    "APPOINTMENT_UPDATED",
                    patient.person_id,
                    existingAppointment,
                    $"appt-update-{existingAppointment.id}-{existingAppointment.updated_at.Ticks}");
            }

            return existingAppointment.ToDto();
        }

        public async Task<bool> DeleteAppointmentAsync(Guid id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                return false;

            var patient = await _patientRepository.GetAll().Include(p => p.Person).FirstOrDefaultAsync(p => p.id == appointment.patient_id);

            try
            {
                // Capture info before delete
                var appointmentId = appointment.id;
                var patientPersonId = patient?.person_id;

                await _appointmentRepository.DeleteAsync(appointment);
                await _appointmentRepository.SaveChangesAsync();

                // Dispatch cancellation notification
                if (patientPersonId.HasValue)
                {
                    try
                    {
                        await _notificationOrchestrator.DispatchAsync(new DispatchNotificationRequest
                        {
                            topic_code = "APPOINTMENT_CANCELLED",
                            channel = "Email",
                            person_ids = new List<Guid> { patientPersonId.Value },
                            idempotency_key = $"appt-cancel-{appointmentId}",
                            initiated_by = "system"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to dispatch cancellation notification for appointment {AppointmentId}", appointmentId);
                    }
                }
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                throw new InvalidOperationException("Cannot delete appointment because there are dependent records (e.g., treatments or documents). Remove or reassign dependent records first.");
            }
            return true;
        }

        /// <summary>
        /// Shared helper to dispatch appointment-related notifications through the orchestrator.
        /// Failures are logged but do not bubble up — appointment operations must not fail due to notification issues.
        /// </summary>
        private async Task DispatchAppointmentNotificationAsync(
            string topicCode, Guid personId, Appointment appointment, string? idempotencyKey = null)
        {
            try
            {
                await _notificationOrchestrator.DispatchAsync(new DispatchNotificationRequest
                {
                    topic_code = topicCode,
                    channel = "Email",
                    person_ids = new List<Guid> { personId },
                    appointment_id = appointment.id,
                    idempotency_key = idempotencyKey ?? $"appt-confirm-{appointment.id}",
                    payload = new Dictionary<string, string>
                    {
                        ["appointment_date"] = appointment.appointment_start_time.ToString("yyyy-MM-dd"),
                        ["appointment_time"] = appointment.appointment_start_time.ToString("HH:mm")
                    },
                    initiated_by = "system"
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to dispatch {TopicCode} notification for appointment {AppointmentId}",
                    topicCode, appointment.id);
            }
        }
    }
}
