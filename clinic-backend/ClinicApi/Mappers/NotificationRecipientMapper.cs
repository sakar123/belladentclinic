using System;
using System.Collections.Generic;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationRecipientMapper
    {
        public static NotificationRecipientDTO ToDto(NotificationRecipient entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationRecipientDTO
            {
                id = entity.id,
                notification_id = entity.notification_id,
                person_id = entity.person_id,
                contact_method_id = entity.contact_method_id,
                recipient_address = entity.recipient_address,
                recipient_type = entity.recipient_type,
                delivery_status = entity.delivery_status,
                provider_message_id = entity.provider_message_id,
                sent_at = entity.sent_at,
                delivered_at = entity.delivered_at,
                opened_at = entity.opened_at,
                clicked_at = entity.clicked_at,
                failed_at = entity.failed_at,
                failure_reason = entity.failure_reason,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by
            };
        }

        public static NotificationRecipient ToEntity(NotificationRecipientDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new NotificationRecipient
            {
                id = dto.id ?? Guid.Empty,
                notification_id = dto.notification_id,
                person_id = dto.person_id,
                contact_method_id = dto.contact_method_id,
                recipient_address = dto.recipient_address,
                recipient_type = dto.recipient_type,
                delivery_status = dto.delivery_status,
                provider_message_id = dto.provider_message_id,
                sent_at = dto.sent_at,
                delivered_at = dto.delivered_at,
                opened_at = dto.opened_at,
                clicked_at = dto.clicked_at,
                failed_at = dto.failed_at,
                failure_reason = dto.failure_reason,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
