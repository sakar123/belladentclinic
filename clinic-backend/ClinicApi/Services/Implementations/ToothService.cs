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

        public async Task<IEnumerable<ToothDTO>> GetAllTeethAsync()
        {
            var teeth = await _toothRepository.GetAllAsync();
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

            // Manual update
            existingTooth.patient_id = toothDto.patient_id;
            existingTooth.tooth_number = toothDto.tooth_number;
            existingTooth.tooth_name = toothDto.tooth_name;
            existingTooth.tooth_status_id = toothDto.tooth_status_id;
            existingTooth.updated_at = DateTime.UtcNow;

            _toothRepository.Update(existingTooth);
            await _toothRepository.SaveChangesAsync();

            return ToothMapper.ToDto(existingTooth, new HashSet<object>());
        }

        public async Task<bool> DeleteToothAsync(Guid id)
        {
            var tooth = await _toothRepository.GetByIdAsync(id);
            if (tooth == null)
                return false;

            _toothRepository.Delete(tooth);
            await _toothRepository.SaveChangesAsync();
            return true;
        }
    }
}
