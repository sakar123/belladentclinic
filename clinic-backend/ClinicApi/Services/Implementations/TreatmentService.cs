using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.EntityFrameworkCore;

namespace ClinicApi.Services.Implementations
{
    public class TreatmentService : ITreatmentService
    {
        private readonly IRepository<Treatment> _treatmentRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IRepository<Service> _serviceRepository;
        private readonly IRepository<Tooth> _toothRepository;

        public TreatmentService(
            IRepository<Treatment> treatmentRepository,
            IRepository<Appointment> appointmentRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IRepository<Service> serviceRepository,
            IRepository<Tooth> toothRepository)
        {
            _treatmentRepository = treatmentRepository;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _serviceRepository = serviceRepository;
            _toothRepository = toothRepository;
        }

        public async Task<IEnumerable<TreatmentDTO>> GetAllTreatmentsAsync()
        {
            var treatments = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .ToListAsync();
            var visited = new HashSet<object>();
            return treatments.Select(t => TreatmentMapper.ToDto(t, visited)).ToList();
        }

        public async Task<TreatmentDTO> GetTreatmentByIdAsync(Guid id)
        {
            var treatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .FirstOrDefaultAsync(t => t.id == id);
            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> CreateTreatmentAsync(TreatmentDTO treatmentDto)
        {
            if (!await _appointmentRepository.ExistsAsync(treatmentDto.appointment_id))
                throw new KeyNotFoundException("Appointment not found");

            if (!await _patientRepository.ExistsAsync(treatmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _staffRepository.ExistsAsync(treatmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");

            if (!await _serviceRepository.ExistsAsync(treatmentDto.service_id))
                throw new KeyNotFoundException("Service not found");

            // Optional: validate service allows requested scope if configured
            var requestedScope = ResolveScope(treatmentDto);
            var serviceWithScopes = await _serviceRepository
                .GetAll()
                .Include(s => s.tooth_scopes)
                .FirstOrDefaultAsync(s => s.id == treatmentDto.service_id);
            if (serviceWithScopes != null && serviceWithScopes.tooth_scopes != null &&
                serviceWithScopes.tooth_scopes.Count > 0)
            {
                var allowed = new HashSet<string>(serviceWithScopes.tooth_scopes.Select(ts => ts.tooth_scope));
                if (!allowed.Contains(requestedScope))
                    throw new KeyNotFoundException($"Service does not support scope '{requestedScope}'");
            }

            // Build entity; resolve teeth based on scope and provided tooth ids/numbers
            var treatment = new Treatment
            {
                id = treatmentDto.id ?? Guid.NewGuid(),
                appointment_id = treatmentDto.appointment_id,
                patient_id = treatmentDto.patient_id,
                staff_id = treatmentDto.staff_id,
                service_id = treatmentDto.service_id,
                treatment_scope = requestedScope,
                notes = treatmentDto.notes,
                appointment = null,
                patient = null,
                staff = null,
                service = null,
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>(),
                teeth = new List<Tooth>()
            };

            var targetToothIds = await ResolveToothIdsAsync(treatmentDto);
            if (treatment.treatment_scope == "NonTooth")
            {
                // No teeth linked
            }
            else if (treatment.treatment_scope == "FullMouth")
            {
                // Link all existing teeth for the patient
                var allTeeth = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id);
                foreach (var tooth in allTeeth)
                {
                    treatment.teeth.Add(tooth);
                }
            }
            else
            {
                // Single or Multiple using resolved list
                foreach (var tid in targetToothIds)
                {
                    var tooth = await _toothRepository.GetByIdAsync(tid);
                    if (tooth != null) treatment.teeth.Add(tooth);
                }
            }

            await _treatmentRepository.AddAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> UpdateTreatmentAsync(Guid id, TreatmentDTO treatmentDto)
        {
            var existingTreatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .FirstOrDefaultAsync(t => t.id == id);
            if (existingTreatment == null)
                throw new KeyNotFoundException("Treatment not found");

            if (!await _appointmentRepository.ExistsAsync(treatmentDto.appointment_id))
                throw new KeyNotFoundException("Appointment not found");

            if (!await _patientRepository.ExistsAsync(treatmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _staffRepository.ExistsAsync(treatmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");

            if (!await _serviceRepository.ExistsAsync(treatmentDto.service_id))
                throw new KeyNotFoundException("Service not found");

            // Manual update
            existingTreatment.appointment_id = treatmentDto.appointment_id;
            existingTreatment.patient_id = treatmentDto.patient_id;
            existingTreatment.staff_id = treatmentDto.staff_id;
            existingTreatment.service_id = treatmentDto.service_id;
            existingTreatment.treatment_scope = ResolveScope(treatmentDto);
            existingTreatment.notes = treatmentDto.notes;
            existingTreatment.updated_at = DateTime.UtcNow;

            // Update teeth links
            var newToothIds = await ResolveToothIdsAsync(treatmentDto);
            existingTreatment.teeth.Clear();
            if (existingTreatment.treatment_scope == "FullMouth")
            {
                var allTeeth = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id);
                foreach (var tooth in allTeeth) existingTreatment.teeth.Add(tooth);
            }
            else if (existingTreatment.treatment_scope != "NonTooth")
            {
                foreach (var tid in newToothIds)
                {
                    var tooth = await _toothRepository.GetByIdAsync(tid);
                    if (tooth != null) existingTreatment.teeth.Add(tooth);
                }
            }

            await _treatmentRepository.UpdateAsync(existingTreatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(existingTreatment, new HashSet<object>());
        }

        public async Task<bool> DeleteTreatmentAsync(Guid id)
        {
            var treatment = await _treatmentRepository.GetByIdAsync(id);
            if (treatment == null)
                return false;

            await _treatmentRepository.DeleteAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();
            return true;
        }

        // Helper methods for scope/tooth resolution
        private static string ResolveScope(TreatmentDTO dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.treatment_scope)) return dto.treatment_scope!;
            // Infer scope from provided tooth fields
            var hasMulti = (dto.tooth_ids != null && dto.tooth_ids.Count > 1) ||
                           (dto.tooth_numbers != null && dto.tooth_numbers.Count > 1);
            var hasSingle = (dto.tooth_id.HasValue && dto.tooth_id.Value != Guid.Empty) ||
                            (dto.tooth_number.HasValue) || (dto.tooth_ids != null && dto.tooth_ids.Count == 1) ||
                            (dto.tooth_numbers != null && dto.tooth_numbers.Count == 1);
            if (hasMulti) return "MultipleTeeth";
            if (hasSingle) return "SingleTooth";
            return "NonTooth"; // default if no tooth info
        }

        private async Task<List<Guid>> ResolveToothIdsAsync(TreatmentDTO dto)
        {
            var ids = new HashSet<Guid>();
            if (dto.tooth_id.HasValue && dto.tooth_id.Value != Guid.Empty)
            {
                ids.Add(dto.tooth_id.Value);
            }

            if (dto.tooth_ids != null)
            {
                foreach (var tid in dto.tooth_ids)
                    if (tid != Guid.Empty)
                        ids.Add(tid);
            }

            if (dto.tooth_number.HasValue)
            {
                var found = await _toothRepository.FindAsync(t =>
                    t.patient_id == dto.patient_id && t.tooth_number == dto.tooth_number.Value);
                var tooth = found.FirstOrDefault();
                if (tooth != null) ids.Add(tooth.id);
            }

            if (dto.tooth_numbers != null)
            {
                foreach (var n in dto.tooth_numbers)
                {
                    var found = await _toothRepository.FindAsync(t =>
                        t.patient_id == dto.patient_id && t.tooth_number == n);
                    var tooth = found.FirstOrDefault();
                    if (tooth != null) ids.Add(tooth.id);
                }
            }

            return ids.ToList();
        }
    }
}
    