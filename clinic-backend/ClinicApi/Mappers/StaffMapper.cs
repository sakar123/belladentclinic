using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Staff entity and its DTO.
    /// </summary>
    public static class StaffMapper
    {
        /// <summary>
        /// Maps a Staff entity to a StaffDTO.
        /// </summary>
        public static StaffDTO ToDto(Staff entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new StaffDTO { id = entity.id, license_number = entity.license_number };

            return new StaffDTO
            {
                id = entity.id,
                person_id = entity.person_id,
                role_id = entity.role_id,
                specialty_id = entity.specialty_id,
                license_number = entity.license_number ?? string.Empty,
                is_active = entity.is_active,
                person = PersonMapper.ToDto(entity.person, visited)
            };
        }

        /// <summary>
        /// Maps a StaffDTO to a Staff entity.
        /// </summary>
        public static Staff ToEntity(StaffDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Staff
            {
                id = dto.id ?? Guid.NewGuid(),
                person_id = dto.person_id ?? Guid.Empty,
                role_id = dto.role_id,
                specialty_id = dto.specialty_id,
                license_number = dto.license_number,
                is_active = dto.is_active,
                // Set required navigation properties to default values or null
                person = null,
                role = null,
                specialty = null,
                // Initialize required collections
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>()
            };
        }
    }
}
