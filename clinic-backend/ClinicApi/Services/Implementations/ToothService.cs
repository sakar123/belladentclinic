using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;

namespace ClinicApi.Services.Implementations
{
    public class ToothService : IToothService
    {
        private readonly IRepository<Tooth> _toothRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<ToothStatus> _toothStatusRepository;

        public ToothService(
            IRepository<Tooth> toothRepository,
            IRepository<Patient> patientRepository,
            IRepository<ToothStatus> toothStatusRepository)
        {
            _toothRepository = toothRepository;
            _patientRepository = patientRepository;
            _toothStatusRepository = toothStatusRepository;
        }

        public async Task<IEnumerable<ToothDTO>> GetAllTeethAsync(Guid? patientId = null)
        {
            IEnumerable<Tooth> teeth;
            if (patientId.HasValue)
            {
                teeth = await _toothRepository.FindAsync(t => t.patient_id == patientId.Value);
            }
            else
            {
                teeth = await _toothRepository.GetAllAsync();
            }
            var visited = new HashSet<object>();
            return teeth.Select(t => ToothMapper.ToDto(t, visited)).ToList();
        }

        public async Task<ToothDTO> GetToothByIdAsync(Guid id)
        {
            var tooth = await _toothRepository.GetByIdAsync(id);
            return ToothMapper.ToDto(tooth, new HashSet<object>());
        }

        public async Task<ToothDTO> CreateToothAsync(ToothDTO toothDto)
        {
            if (!await _patientRepository.ExistsAsync(toothDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _toothStatusRepository.ExistsAsync(toothDto.tooth_status_id))
                throw new KeyNotFoundException("Tooth status not found");

            // Idempotency: if a tooth with same patient_id + tooth_number exists, return it instead of erroring
            var existing = (await _toothRepository.FindAsync(t => t.patient_id == toothDto.patient_id && t.tooth_number == toothDto.tooth_number)).FirstOrDefault();
            if (existing != null)
            {
                return ToothMapper.ToDto(existing, new HashSet<object>());
            }

            var tooth = ToothMapper.ToEntity(toothDto, new HashSet<object>());
            await _toothRepository.AddAsync(tooth);
            await _toothRepository.SaveChangesAsync();

            return ToothMapper.ToDto(tooth, new HashSet<object>());
        }

        public async Task<ToothDTO> UpdateToothAsync(Guid id, ToothDTO toothDto)
        {
            var existingTooth = await _toothRepository.GetByIdAsync(id);
            if (existingTooth == null)
                throw new KeyNotFoundException("Tooth not found");

            if (!await _patientRepository.ExistsAsync(toothDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _toothStatusRepository.ExistsAsync(toothDto.tooth_status_id))
                throw new KeyNotFoundException("Tooth status not found");

            // Validate incompatible status transitions
            var currentStatus = await _toothStatusRepository.GetByIdAsync(existingTooth.tooth_status_id);
            var requestedStatus = await _toothStatusRepository.GetByIdAsync(toothDto.tooth_status_id);
            var vr = ToothStatusValidator.Validate(currentStatus?.code, requestedStatus?.code);
            if (!vr.IsValid)
            {
                throw new ClinicApi.Models.Exceptions.IncompatibleToothStatusException(vr.CurrentStatus ?? "", vr.NewStatus ?? "", vr.Reason);
            }

            // Manual update
            existingTooth.patient_id = toothDto.patient_id;
            existingTooth.tooth_number = toothDto.tooth_number;
            existingTooth.tooth_name = toothDto.tooth_name;
            existingTooth.tooth_status_id = toothDto.tooth_status_id;
            existingTooth.updated_at = DateTime.UtcNow;

            await _toothRepository.UpdateAsync(existingTooth);
            await _toothRepository.SaveChangesAsync();

            return ToothMapper.ToDto(existingTooth, new HashSet<object>());
        }

        public async Task<bool> DeleteToothAsync(Guid id)
        {
            var tooth = await _toothRepository.GetByIdAsync(id);
            if (tooth == null)
                return false;

            await _toothRepository.DeleteAsync(tooth);
            await _toothRepository.SaveChangesAsync();
            return true;
        }
    }
}
