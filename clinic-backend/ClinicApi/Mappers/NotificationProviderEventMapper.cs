using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationProviderEventMapper
    {
        public static NotificationProviderEventDTO ToDto(NotificationProviderEvent entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationProviderEventDTO
            {
                id = entity.id,
                notification_recipient_id = entity.notification_recipient_id,
                provider = entity.provider,
                event_type = entity.event_type,
                event_time = entity.event_time,
                payload = entity.payload,
                created_at = entity.created_at
            };
        }

        public static NotificationProviderEvent ToEntity(NotificationProviderEventDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new NotificationProviderEvent
            {
                id = dto.id ?? Guid.Empty,
                notification_recipient_id = dto.notification_recipient_id,
                provider = dto.provider,
                event_type = dto.event_type,
                event_time = dto.event_time,
                payload = dto.payload,
                created_at = dto.created_at
            };
        }
    }
}
