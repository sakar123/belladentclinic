using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Specialty entity and its DTO.
    /// </summary>
    public static class SpecialtyMapper
    {
        /// <summary>
        /// Maps a Specialty entity to a SpecialtyDTO.
        /// </summary>
        public static SpecialtyDTO ToDto(Specialty entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new SpecialtyDTO { id = entity.id };

            return new SpecialtyDTO
            {
                id = entity.id,
                name = entity.name,
                description = entity.description
            };
        }

        /// <summary>
        /// Maps a SpecialtyDTO to a Specialty entity.
        /// </summary>
        public static Specialty ToEntity(SpecialtyDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Specialty
            {
                id = dto.id ?? Guid.NewGuid(),
                name = dto.name,
                description = dto.description,
                staff = new List<Staff>(),
                services = new List<Service>()
            };
        }
    }
}