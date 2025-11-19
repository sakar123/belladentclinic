using System;
using System.Collections.Generic;
using System.Linq;
using ClinicApi.Models.Entities;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Mappers
{
    public static class AppointmentMapper
    {
        public static AppointmentDTO ToDto(Appointment entity, HashSet<object> visited = null)
        {
            if (entity == null)
                return null;

            visited = visited ?? new HashSet<object>();
            
            if (visited.Contains(entity))
                return null;
                
            visited.Add(entity);

            var dto = new AppointmentDTO
            {
                id = entity.id,
                patient_id = entity.patient_id,
                staff_id = entity.staff_id,
                status_id = entity.status_id,
                appointment_start_time = entity.appointment_start_time,
                duration_minutes = entity.duration_minutes,
                reason_for_visit = entity.reason_for_visit,
                notes = entity.notes
            };

            return dto;
        }

        public static Appointment ToEntity(AppointmentDTO dto, HashSet<object> visited = null)
        {
            if (dto == null)
                return null;

            visited = visited ?? new HashSet<object>();
            
            if (visited.Contains(dto))
                return null;
                
            visited.Add(dto);

            var entity = new Appointment
            {
                id = dto.id ?? Guid.Empty,
                patient_id = dto.patient_id,
                staff_id = dto.staff_id,
                status_id = dto.status_id,
                appointment_start_time = dto.appointment_start_time,
                duration_minutes = dto.duration_minutes,
                reason_for_visit = dto.reason_for_visit,
                notes = dto.notes,
                patient = null, // Set to null or map from DTO if available
                staff = null,   // Set to null or map from DTO if available
                status = null,  // Set to null or map from DTO if available
                treatments = new List<Treatment>() // Set to empty list or map from DTO if available
            };

            return entity;
        }
    }
}
