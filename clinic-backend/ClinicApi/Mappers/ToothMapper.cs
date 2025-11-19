using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Tooth entity and its DTO.
    /// </summary>
    public static class ToothMapper
    {
        /// <summary>
        /// Maps a Tooth entity to a ToothDTO.
        /// </summary>
        public static ToothDTO ToDto(Tooth entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new ToothDTO { id = entity.id };

            return new ToothDTO
            {
                id = entity.id,
                patient_id = entity.patient_id,
                tooth_number = entity.tooth_number,
                tooth_name = entity.tooth_name,
                tooth_status_id = entity.tooth_status_id
            };
        }

        /// <summary>
        /// Maps a ToothDTO to a Tooth entity.
        /// </summary>
        public static Tooth ToEntity(ToothDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Tooth
            {
                id = dto.id ?? Guid.NewGuid(),
                patient_id = dto.patient_id,
                tooth_number = dto.tooth_number,
                tooth_name = dto.tooth_name,
                tooth_status_id = dto.tooth_status_id,
                treatments = new List<Treatment>(),
                documents = new List<Document>(),
                patient = null, // TODO: Set to appropriate Patient instance if available
                tooth_status = null // TODO: Set to appropriate ToothStatus instance if available
            };
        }
    }
}