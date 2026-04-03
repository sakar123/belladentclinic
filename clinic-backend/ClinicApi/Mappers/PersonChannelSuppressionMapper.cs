using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class PersonChannelSuppressionMapper
    {
        public static PersonChannelSuppressionDTO ToDto(PersonChannelSuppression entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new PersonChannelSuppressionDTO
            {
                id = entity.id,
                person_id = entity.person_id,
                channel = entity.channel,
                contact_value = entity.contact_value,
                reason = entity.reason,
                suppressed_at = entity.suppressed_at,
                expires_at = entity.expires_at,
                is_active = entity.is_active,
                created_at = entity.created_at,
                created_by = entity.created_by
            };
        }

        public static PersonChannelSuppression ToEntity(PersonChannelSuppressionDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new PersonChannelSuppression
            {
                id = dto.id ?? Guid.Empty,
                person_id = dto.person_id,
                channel = dto.channel,
                contact_value = dto.contact_value,
                reason = dto.reason,
                suppressed_at = dto.suppressed_at,
                expires_at = dto.expires_at,
                is_active = dto.is_active,
                created_at = dto.created_at,
                created_by = dto.created_by
            };
        }
    }
}
