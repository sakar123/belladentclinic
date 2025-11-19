using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between SaleItem entity and its DTO.
    /// </summary>
    public static class SaleItemMapper
    {
        /// <summary>
        /// Maps a SaleItem entity to a SaleItemDTO.
        /// </summary>
        public static SaleItemDTO ToDto(SaleItem entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new SaleItemDTO { id = entity.id };

            return new SaleItemDTO
            {
                id = entity.id,
                quantity = entity.quantity,
                discount_id = entity.discount_id,
                patient_id = entity.patient_id,
                cost = entity.cost
            };
        }

        /// <summary>
        /// Maps a SaleItemDTO to a SaleItem entity.
        /// </summary>
        public static SaleItem ToEntity(SaleItemDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new SaleItem
            {
                id = dto.id ?? Guid.NewGuid(),
                quantity = dto.quantity,
                discount_id = dto.discount_id,
                patient_id = dto.patient_id,
                cost = dto.cost,
                discount_type = null, // Ensure SaleItemDTO has this property
                patient = null              // Ensure SaleItemDTO has this property
            };
        }
    }
}