using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between AppointmentStatus entity and its DTO.
    /// </summary>
    public static class AppointmentStatusMapper
    {
        /// <summary>
        /// Maps an AppointmentStatus entity to an AppointmentStatusDTO.
        /// </summary>
        public static AppointmentStatusDTO ToDto(AppointmentStatus entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new AppointmentStatusDTO { id = entity.id, name = entity.name };

            return new AppointmentStatusDTO
            {
                id = entity.id,
                name = entity.name
            };
        }

        /// <summary>
        /// Maps an AppointmentStatusDTO to an AppointmentStatus entity.
        /// </summary>
        public static AppointmentStatus ToEntity(AppointmentStatusDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new AppointmentStatus
            {
                id = dto.id ?? Guid.NewGuid(),
                name = dto.name,
                appointments = new List<Appointment>()
            };
        }
    }
}