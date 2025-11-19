using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between ToothStatus entity and its DTO.
    /// </summary>
    public static class ToothStatusMapper
    {
        /// <summary>
        /// Maps a ToothStatus entity to a ToothStatusDTO.
        /// </summary>
        public static ToothStatusDTO ToDto(ToothStatus entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new ToothStatusDTO { id = entity.id };

            return new ToothStatusDTO
            {
                id = entity.id,
                code = entity.code,
                description = entity.description
            };
        }

        /// <summary>
        /// Maps a ToothStatusDTO to a ToothStatus entity.
        /// </summary>
        public static ToothStatus ToEntity(ToothStatusDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new ToothStatus
            {
                id = dto.id ?? Guid.NewGuid(),
                code = dto.code,
                description = dto.description,
                teeth = new List<Tooth>()
            };
        }
    }
}