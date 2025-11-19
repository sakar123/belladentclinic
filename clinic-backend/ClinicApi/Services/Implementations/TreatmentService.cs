using System;
using System.Collections.Generic;
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
            if (!await _toothRepository.ExistsAsync(treatmentDto.tooth_id))
                throw new KeyNotFoundException("Tooth not found");

            var treatment = TreatmentMapper.ToEntity(treatmentDto, new HashSet<object>());
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
            if (!await _toothRepository.ExistsAsync(treatmentDto.tooth_id))
                throw new KeyNotFoundException("Tooth not found");

            // Manual update
            existingTreatment.appointment_id = treatmentDto.appointment_id;
            existingTreatment.patient_id = treatmentDto.patient_id;
            existingTreatment.staff_id = treatmentDto.staff_id;
            existingTreatment.service_id = treatmentDto.service_id;
            existingTreatment.tooth_id = treatmentDto.tooth_id;
            existingTreatment.notes = treatmentDto.notes;
            existingTreatment.updated_at = DateTime.UtcNow;

            _treatmentRepository.Update(existingTreatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(existingTreatment, new HashSet<object>());
        }

        public async Task<bool> DeleteTreatmentAsync(Guid id)
        {
            var treatment = await _treatmentRepository.GetByIdAsync(id);
            if (treatment == null)
                return false;

            _treatmentRepository.Delete(treatment);
            await _treatmentRepository.SaveChangesAsync();
            return true;
        }
    }
}
