using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Service entity and its DTO.
    /// </summary>
    public static class ServiceMapper
    {
        /// <summary>
        /// Maps a Service entity to a ServiceDTO.
        /// </summary>
        public static ServiceDTO ToDto(Service entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new ServiceDTO { id = entity.id };

            return new ServiceDTO
            {
                id = entity.id,
                specialty_id = entity.specialty_id,
                name = entity.name,
                description = entity.description,
                cost = entity.cost
            };
        }

        /// <summary>
        /// Maps a ServiceDTO to a Service entity.
        /// </summary>
        public static Service ToEntity(ServiceDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Service
            {
                id = dto.id ?? Guid.NewGuid(),
                specialty_id = dto.specialty_id,
                specialty = null, // TODO: Set this to the appropriate Specialty instance
                name = dto.name,
                description = dto.description,
                cost = dto.cost,
                treatments = new List<Treatment>()
            };
        }
    }
}