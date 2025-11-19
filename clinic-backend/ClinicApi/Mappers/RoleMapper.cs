using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Role entity and its DTO.
    /// </summary>
    public static class RoleMapper
    {
        /// <summary>
        /// Maps a Role entity to a RoleDTO.
        /// </summary>
        public static RoleDTO ToDto(Role entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new RoleDTO { id = entity.id };

            return new RoleDTO
            {
                id = entity.id,
                name = entity.name,
                description = entity.description
            };
        }

        /// <summary>
        /// Maps a RoleDTO to a Role entity.
        /// </summary>
        public static Role ToEntity(RoleDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Role
            {
                id = dto.id ?? Guid.NewGuid(),
                name = dto.name,
                description = dto.description,
                staff = new List<Staff>()
            };
        }
    }
}