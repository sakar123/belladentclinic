using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;

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
            var treatments = await _treatmentRepository.GetAllAsync();
            var visited = new HashSet<object>();
            return treatments.Select(t => TreatmentMapper.ToDto(t, visited)).ToList();
        }

        public async Task<TreatmentDTO> GetTreatmentByIdAsync(Guid id)
        {
            var treatment = await _treatmentRepository.GetByIdAsync(id);
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

            // Resolve tooth by id or by (patient_id, tooth_number)
            Guid resolvedToothId = Guid.Empty;
            if (treatmentDto.tooth_id.HasValue && treatmentDto.tooth_id.Value != Guid.Empty)
            {
                if (!await _toothRepository.ExistsAsync(treatmentDto.tooth_id.Value))
                    throw new KeyNotFoundException("Tooth not found");
                resolvedToothId = treatmentDto.tooth_id.Value;
            }
            else if (treatmentDto.tooth_number.HasValue)
            {
                var toothList = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id && t.tooth_number == treatmentDto.tooth_number.Value);
                var tooth = toothList.FirstOrDefault();
                if (tooth == null)
                    throw new KeyNotFoundException("Tooth not found for patient and tooth_number");
                resolvedToothId = tooth.id;
            }
            else
            {
                throw new KeyNotFoundException("Tooth not specified");
            }

            // Build entity explicitly to ensure resolved tooth id is used
            var treatment = new Treatment
            {
                id = treatmentDto.id ?? Guid.NewGuid(),
                appointment_id = treatmentDto.appointment_id,
                patient_id = treatmentDto.patient_id,
                staff_id = treatmentDto.staff_id,
                service_id = treatmentDto.service_id,
                tooth_id = resolvedToothId,
                notes = treatmentDto.notes,
                appointment = null,
                patient = null,
                staff = null,
                service = null,
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>()
            };
            await _treatmentRepository.AddAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> UpdateTreatmentAsync(Guid id, TreatmentDTO treatmentDto)
        {
            var existingTreatment = await _treatmentRepository.GetByIdAsync(id);
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

            // Resolve tooth id if needed
            Guid resolvedToothId = existingTreatment.tooth_id;
            if (treatmentDto.tooth_id.HasValue && treatmentDto.tooth_id.Value != Guid.Empty)
            {
                if (!await _toothRepository.ExistsAsync(treatmentDto.tooth_id.Value))
                    throw new KeyNotFoundException("Tooth not found");
                resolvedToothId = treatmentDto.tooth_id.Value;
            }
            else if (treatmentDto.tooth_number.HasValue)
            {
                var toothList = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id && t.tooth_number == treatmentDto.tooth_number.Value);
                var tooth = toothList.FirstOrDefault();
                if (tooth == null)
                    throw new KeyNotFoundException("Tooth not found for patient and tooth_number");
                resolvedToothId = tooth.id;
            }

            // Manual update
            existingTreatment.appointment_id = treatmentDto.appointment_id;
            existingTreatment.patient_id = treatmentDto.patient_id;
            existingTreatment.staff_id = treatmentDto.staff_id;
            existingTreatment.service_id = treatmentDto.service_id;
            existingTreatment.tooth_id = resolvedToothId;
            existingTreatment.notes = treatmentDto.notes;
            existingTreatment.updated_at = DateTime.UtcNow;

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
    }
}
