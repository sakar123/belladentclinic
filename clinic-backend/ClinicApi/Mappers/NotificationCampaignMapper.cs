using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationCampaignMapper
    {
        public static NotificationCampaignDTO ToDto(NotificationCampaign entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationCampaignDTO
            {
                id = entity.id,
                name = entity.name,
                topic_id = entity.topic_id,
                template_id = entity.template_id,
                channel = entity.channel,
                audience_scope = entity.audience_scope,
                status = entity.status,
                scheduled_at = entity.scheduled_at,
                launched_at = entity.launched_at,
                completed_at = entity.completed_at,
                description = entity.description,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static NotificationCampaign ToEntity(NotificationCampaignDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new NotificationCampaign
            {
                id = dto.id ?? Guid.Empty,
                name = dto.name,
                topic_id = dto.topic_id,
                template_id = dto.template_id,
                channel = dto.channel,
                audience_scope = dto.audience_scope,
                status = dto.status,
                scheduled_at = dto.scheduled_at,
                launched_at = dto.launched_at,
                completed_at = dto.completed_at,
                description = dto.description,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
