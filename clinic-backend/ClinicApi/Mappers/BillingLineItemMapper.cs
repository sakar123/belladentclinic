using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between BillingLineItem entity and its DTO.
    /// </summary>
    public static class BillingLineItemMapper
    {
        /// <summary>
        /// Maps a BillingLineItem entity to a BillingLineItemDTO.
        /// </summary>
        public static BillingLineItemDTO ToDto(BillingLineItem entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new BillingLineItemDTO { id = entity.id, description = entity.description };

            return new BillingLineItemDTO
            {
                id = entity.id,
                billing_id = entity.billing_id,
                treatment_id = entity.treatment_id,
                description = entity.description,
                quantity = entity.quantity,
                unit_price = entity.unit_price,
                discount_percentage = entity.discount_percentage
            };
        }

        /// <summary>
        /// Maps a BillingLineItemDTO to a BillingLineItem entity.
        /// </summary>
        public static BillingLineItem ToEntity(BillingLineItemDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new BillingLineItem
            {
                id = dto.id ?? Guid.NewGuid(),
                billing_id = dto.billing_id,
                treatment_id = dto.treatment_id,
                description = dto.description,
                quantity = dto.quantity,
                unit_price = dto.unit_price,
                discount_percentage = dto.discount_percentage,
                billing = null!,
                treatment = null!
            };
        }
    }
}