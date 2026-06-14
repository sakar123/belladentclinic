using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationTopicMapper
    {
        public static NotificationTopicDTO ToDto(NotificationTopic entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationTopicDTO
            {
                id = entity.id,
                code = entity.code,
                name = entity.name,
                description = entity.description,
                category = entity.category,
                audience_scope = entity.audience_scope,
                is_active = entity.is_active,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static NotificationTopic ToEntity(NotificationTopicDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new NotificationTopic
            {
                id = dto.id ?? Guid.Empty,
                code = dto.code,
                name = dto.name,
                description = dto.description,
                category = dto.category,
                audience_scope = dto.audience_scope,
                is_active = dto.is_active,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
