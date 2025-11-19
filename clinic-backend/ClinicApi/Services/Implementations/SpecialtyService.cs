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
    public class SpecialtyService : ISpecialtyService
    {
        private readonly IRepository<Specialty> _specialtyRepository;

        public SpecialtyService(IRepository<Specialty> specialtyRepository)
        {
            _specialtyRepository = specialtyRepository;
        }

        public async Task<IEnumerable<SpecialtyDTO>> GetAllSpecialtiesAsync()
        {
            var specialties = await _specialtyRepository.GetAllAsync();
            var visited = new HashSet<object>();

            return specialties.Select(s => SpecialtyMapper.ToDto(s, visited)).ToList();
        }

        public async Task<SpecialtyDTO> GetSpecialtyByIdAsync(Guid id)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(id);
            var visited = new HashSet<object>();

            return SpecialtyMapper.ToDto(specialty, visited);
        }

        public async Task<SpecialtyDTO> CreateSpecialtyAsync(SpecialtyDTO specialtyDto)
        {
            var visited = new HashSet<object>();
            var specialty = SpecialtyMapper.ToEntity(specialtyDto, visited);

            await _specialtyRepository.AddAsync(specialty);
            await _specialtyRepository.SaveChangesAsync();

            return SpecialtyMapper.ToDto(specialty, new HashSet<object>());
        }

        public async Task<SpecialtyDTO> UpdateSpecialtyAsync(Guid id, SpecialtyDTO specialtyDto)
        {
            var existingSpecialty = await _specialtyRepository.GetByIdAsync(id);
            if (existingSpecialty == null)
                throw new KeyNotFoundException("Specialty not found");

            // Manual update instead of AutoMapper
            existingSpecialty.name = specialtyDto.name;
            existingSpecialty.description = specialtyDto.description;

            _specialtyRepository.Update(existingSpecialty);
            await _specialtyRepository.SaveChangesAsync();

            return SpecialtyMapper.ToDto(existingSpecialty, new HashSet<object>());
        }

        public async Task<bool> DeleteSpecialtyAsync(Guid id)
        {
            var specialty = await _specialtyRepository.GetByIdAsync(id);
            if (specialty == null)
                return false;

            _specialtyRepository.Delete(specialty);
            await _specialtyRepository.SaveChangesAsync();
            return true;
        }
    }
}
