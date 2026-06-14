using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class PersonContactMethodMapper
    {
        public static PersonContactMethodDTO ToDto(PersonContactMethod entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new PersonContactMethodDTO
            {
                id = entity.id,
                person_id = entity.person_id,
                channel = entity.channel,
                contact_value = entity.contact_value,
                is_primary = entity.is_primary,
                is_verified = entity.is_verified,
                is_active = entity.is_active,
                verified_at = entity.verified_at,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static PersonContactMethod ToEntity(PersonContactMethodDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new PersonContactMethod
            {
                id = dto.id ?? Guid.Empty,
                person_id = dto.person_id,
                channel = dto.channel,
                contact_value = dto.contact_value,
                is_primary = dto.is_primary,
                is_verified = dto.is_verified,
                is_active = dto.is_active,
                verified_at = dto.verified_at,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
