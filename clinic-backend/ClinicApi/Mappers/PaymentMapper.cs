using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Payment entity and its DTO.
    /// </summary>
    public static class PaymentMapper
    {
        /// <summary>
        /// Maps a Payment entity to a PaymentDTO.
        /// </summary>
        public static PaymentDTO ToDto(Payment entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new PaymentDTO { id = entity.id };

            return new PaymentDTO
            {
                id = entity.id,
                billing_id = entity.billing_id,
                amount = entity.amount,
                payment_date = entity.payment_date,
                method = entity.method,
                transaction_ref = entity.transaction_ref,
                created_by = entity.created_by
            };
        }

        /// <summary>
        /// Maps a PaymentDTO to a Payment entity.
        /// </summary>
        public static Payment ToEntity(PaymentDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Payment
            {
                id = dto.id ?? Guid.NewGuid(),
                billing_id = dto.billing_id,
                amount = dto.amount,
                payment_date = dto.payment_date,
                method = dto.method,
                transaction_ref = dto.transaction_ref,
                created_by = dto.created_by,
                billing = null
            };
        }
    }
}