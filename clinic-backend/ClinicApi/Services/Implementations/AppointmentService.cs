using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
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
        private readonly IEmailService _emailService;
        private readonly Microsoft.Extensions.Options.IOptions<ClinicApi.Models.AppSettings.ClinicSettings> _clinicSettings;

        public AppointmentService(
            IRepository<Appointment> appointmentRepository,
            IRepository<AppointmentStatus> statusRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IPatientService patientService,
            ILogger<AppointmentService> logger,
            IEmailService emailService,
            Microsoft.Extensions.Options.IOptions<ClinicApi.Models.AppSettings.ClinicSettings> clinicSettings)
        {
            _appointmentRepository = appointmentRepository;
            _statusRepository = statusRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _patientService = patientService;
            _logger = logger;
            _emailService = emailService;
            _clinicSettings = clinicSettings;
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

            if (!string.IsNullOrEmpty(patientEntity.Person.email))
            { 
                //send email to user
                _emailService.SendEmailAsync(
                    patientEntity.Person.email,
                    "Appointment Confirmation",
                    $"Your appointment is confirmed for {newAppointment.appointment_start_time.ToShortDateString()} at {newAppointment.appointment_start_time.ToShortTimeString()}."
                );
                //send email to clinic
                var clinicEmail = _clinicSettings.Value?.ClinicEmail;
                if (!string.IsNullOrWhiteSpace(clinicEmail))
                {
                    _logger.LogInformation("Sending clinic notification to {ClinicEmail}", clinicEmail);
                    var displayName = ($"{patientEntity.Person.first_name} {patientEntity.Person.last_name}").Trim();
                    var who = string.IsNullOrWhiteSpace(displayName) ? patientEntity.Person.email : displayName;
                    _emailService.SendEmailAsync(
                        clinicEmail!,
                        "Appointment Booked",
                        $"New appointment booked by {who} for {newAppointment.appointment_start_time.ToShortDateString()} at {newAppointment.appointment_start_time.ToShortTimeString()}."
                    );
                }
                else
                {
                    _logger.LogWarning("ClinicSettings.ClinicEmail is not configured. Skipping clinic notification email.");
                }
            }
            else
            {
                _logger.LogWarning("Patient {PatientId} has no email address. Skipping email notification.", newAppointment.patient_id);
            }

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

            if (!string.IsNullOrEmpty(patient.Person.email))
            {
                await _emailService.SendEmailAsync(
                    patient.Person.email,
                    "Appointment Confirmation",
                    $"Your appointment is confirmed for {appointment.appointment_start_time.ToShortDateString()} at {appointment.appointment_start_time.ToShortTimeString()}."
                );
            }
            else
            {
                _logger.LogWarning("Patient {PatientId} has no email address. Skipping email notification.", appointment.patient_id);
            }

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

            var patient = await _patientRepository.GetAll().Include(p => p.Person).FirstOrDefaultAsync(p => p.id == existingAppointment.patient_id);
            if (patient != null && !string.IsNullOrEmpty(patient.Person.email))
            {
                await _emailService.SendEmailAsync(
                    patient.Person.email,
                    "Appointment Updated",
                    $"Your appointment has been updated to {existingAppointment.appointment_start_time.ToShortDateString()} at {existingAppointment.appointment_start_time.ToShortTimeString()}."
                );
            }
            else
            {
                _logger.LogWarning("Patient {PatientId} has no email address. Skipping email notification.", existingAppointment.patient_id);
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
                await _appointmentRepository.DeleteAsync(appointment);
                await _appointmentRepository.SaveChangesAsync();

                if (patient != null && !string.IsNullOrEmpty(patient.Person.email))
                {
                    await _emailService.SendEmailAsync(
                        patient.Person.email,
                        "Appointment Cancelled",
                        $"Your appointment for {appointment.appointment_start_time.ToShortDateString()} at {appointment.appointment_start_time.ToShortTimeString()} has been cancelled."
                    );
                }
                else
                {
                    _logger.LogWarning("Patient {PatientId} has no email address. Skipping email notification.", appointment.patient_id);
                }
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                throw new InvalidOperationException("Cannot delete appointment because there are dependent records (e.g., treatments or documents). Remove or reassign dependent records first.");
            }
            return true;
        }
    }
}
