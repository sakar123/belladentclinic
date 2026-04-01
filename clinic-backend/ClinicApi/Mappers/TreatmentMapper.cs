using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;
using System.Linq;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Treatment entity and its DTO.
    /// </summary>
    public static class TreatmentMapper
    {
        /// <summary>
        /// Maps a Treatment entity to a TreatmentDTO.
        /// </summary>
        public static TreatmentDTO ToDto(Treatment entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new TreatmentDTO { id = entity.id };

            return new TreatmentDTO
            {
                id = entity.id,
                appointment_id = entity.appointment_id,
                patient_id = entity.patient_id,
                staff_id = entity.staff_id,
                service_id = entity.service_id,
                treatment_scope = entity.treatment_scope,
                // Back-compat single fields: take the first tooth if any
                tooth_id = entity.teeth.FirstOrDefault()?.id,
                tooth_number = entity.teeth.FirstOrDefault()?.tooth_number,
                // New multi-tooth fields
                tooth_ids = entity.teeth.Select(t => t.id).ToList(),
                tooth_numbers = entity.teeth.Select(t => t.tooth_number).ToList(),
                notes = entity.notes
            };
        }

        /// <summary>
        /// Maps a TreatmentDTO to a Treatment entity.
        /// </summary>
        public static Treatment ToEntity(TreatmentDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            var entity = new Treatment
            {
                id = dto.id ?? Guid.NewGuid(),
                appointment_id = dto.appointment_id,
                patient_id = dto.patient_id,
                staff_id = dto.staff_id,
                service_id = dto.service_id,
                treatment_scope = dto.treatment_scope ?? "SingleTooth",
                // Set required navigation properties to null or appropriate values if available
                appointment = null,
                patient = null,
                staff = null,
                service = null,
                notes = dto.notes,
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>(),
                teeth = new List<Tooth>()
            };
            
            return entity;
        }
    }
}
