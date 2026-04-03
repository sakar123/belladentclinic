using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class PersonNotificationPreferenceMapper
    {
        public static PersonNotificationPreferenceDTO ToDto(PersonNotificationPreference entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new PersonNotificationPreferenceDTO
            {
                id = entity.id,
                person_id = entity.person_id,
                topic_id = entity.topic_id,
                channel = entity.channel,
                is_enabled = entity.is_enabled,
                opt_in_status = entity.opt_in_status,
                opted_in_at = entity.opted_in_at,
                opted_out_at = entity.opted_out_at,
                source = entity.source,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static PersonNotificationPreference ToEntity(PersonNotificationPreferenceDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new PersonNotificationPreference
            {
                id = dto.id ?? Guid.Empty,
                person_id = dto.person_id,
                topic_id = dto.topic_id,
                channel = dto.channel,
                is_enabled = dto.is_enabled,
                opt_in_status = dto.opt_in_status,
                opted_in_at = dto.opted_in_at,
                opted_out_at = dto.opted_out_at,
                source = dto.source,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
