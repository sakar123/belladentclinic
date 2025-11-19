using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Prescription entity and its DTO.
    /// </summary>
    public static class PrescriptionMapper
    {
        /// <summary>
        /// Maps a Prescription entity to a PrescriptionDTO.
        /// </summary>
        public static PrescriptionDTO ToDto(Prescription entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new PrescriptionDTO { id = entity.id, drug_name = entity.drug_name };

            return new PrescriptionDTO
            {
                id = entity.id,
                treatment_id = entity.treatment_id,
                drug_name = entity.drug_name,
                dosage = entity.dosage,
                instructions = entity.instructions
            };
        }

        /// <summary>
        /// Maps a PrescriptionDTO to a Prescription entity.
        /// </summary>
        public static Prescription ToEntity(PrescriptionDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Prescription
            {
                id = dto.id ?? Guid.NewGuid(),
                treatment_id = dto.treatment_id,
                drug_name = dto.drug_name,
                dosage = dto.dosage,
                instructions = dto.instructions,
                treatment = null // TODO: Set this to the appropriate Treatment instance if available
            };
        }
    }
}