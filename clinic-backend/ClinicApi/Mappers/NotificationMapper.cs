using System;
using System.Collections.Generic;
using System.Linq;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class NotificationMapper
    {
        public static NotificationDTO ToDto(Notification entity, HashSet<object> visited = null)
        {
            if (entity == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(entity)) return null;
            visited.Add(entity);

            return new NotificationDTO
            {
                id = entity.id,
                topic_id = entity.topic_id,
                template_id = entity.template_id,
                campaign_id = entity.campaign_id,
                appointment_id = entity.appointment_id,
                patient_id = entity.patient_id,
                staff_id = entity.staff_id,
                channel = entity.channel,
                provider = entity.provider,
                status = entity.status,
                subject_rendered = entity.subject_rendered,
                body_rendered_text = entity.body_rendered_text,
                body_rendered_html = entity.body_rendered_html,
                scheduled_for = entity.scheduled_for,
                processed_at = entity.processed_at,
                error_message = entity.error_message,
                created_at = entity.created_at,
                updated_at = entity.updated_at,
                created_by = entity.created_by,
                updated_by = entity.updated_by,
                recipients = entity.recipients?.Select(r => NotificationRecipientMapper.ToDto(r, visited)).ToList()
            };
        }

        public static Notification ToEntity(NotificationDTO dto, HashSet<object> visited = null)
        {
            if (dto == null) return null;
            visited = visited ?? new HashSet<object>();
            if (visited.Contains(dto)) return null;
            visited.Add(dto);

            return new Notification
            {
                id = dto.id ?? Guid.Empty,
                topic_id = dto.topic_id,
                template_id = dto.template_id,
                campaign_id = dto.campaign_id,
                appointment_id = dto.appointment_id,
                patient_id = dto.patient_id,
                staff_id = dto.staff_id,
                channel = dto.channel,
                provider = dto.provider,
                status = dto.status,
                subject_rendered = dto.subject_rendered,
                body_rendered_text = dto.body_rendered_text,
                body_rendered_html = dto.body_rendered_html,
                scheduled_for = dto.scheduled_for,
                processed_at = dto.processed_at,
                error_message = dto.error_message,
                created_at = dto.created_at,
                updated_at = dto.updated_at,
                created_by = dto.created_by,
                updated_by = dto.updated_by
            };
        }
    }
}
