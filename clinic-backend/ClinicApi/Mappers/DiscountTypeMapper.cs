using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between DiscountType entity and its DTO.
    /// </summary>
    public static class DiscountTypeMapper
    {
        /// <summary>
        /// Maps a DiscountType entity to a DiscountTypeDTO.
        /// </summary>
        public static DiscountTypeDTO ToDto(DiscountType entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new DiscountTypeDTO { id = entity.id };

            return new DiscountTypeDTO
            {
                id = entity.id,
                discount_name = entity.discount_name,
                discount_percentage = entity.discount_percentage
            };
        }

        /// <summary>
        /// Maps a DiscountTypeDTO to a DiscountType entity.
        /// </summary>
        public static DiscountType ToEntity(DiscountTypeDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new DiscountType
            {
                id = dto.id ?? Guid.NewGuid(),
                discount_name = dto.discount_name,
                discount_percentage = dto.discount_percentage,
                sale_item = new List<SaleItem>()
            };
        }
    }
}