using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationTemplateMapper
    {
        public static NotificationTemplateDTO ToDto(NotificationTemplate entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationTemplateDTO
            {
                id = entity.id,
                code = entity.code,
                topic_id = entity.topic_id,
                channel = entity.channel,
                audience_scope = entity.audience_scope,
                provider = entity.provider,
                subject_template = entity.subject_template,
                body_text = entity.body_text,
                body_html = entity.body_html,
                is_active = entity.is_active,
                description = entity.description,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static NotificationTemplate ToEntity(NotificationTemplateDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new NotificationTemplate
            {
                id = dto.id ?? Guid.Empty,
                code = dto.code,
                topic_id = dto.topic_id,
                channel = dto.channel,
                audience_scope = dto.audience_scope,
                provider = dto.provider,
                subject_template = dto.subject_template,
                body_text = dto.body_text,
                body_html = dto.body_html,
                is_active = dto.is_active,
                description = dto.description,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
