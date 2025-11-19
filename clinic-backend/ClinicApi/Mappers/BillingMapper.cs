using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using System.Collections.Generic;

namespace ClinicApi.Mappers
{
    /// <summary>
    /// Contains mapping logic between Billing entity and its DTO.
    /// </summary>
    public static class BillingMapper
    {
        /// <summary>
        /// Maps a Billing entity to a BillingDTO.
        /// </summary>
        public static BillingDTO ToDto(Billing entity, HashSet<object> visited)
        {
            if (entity == null) return null;
            if (!visited.Add(entity)) return new BillingDTO { id = entity.id };

            return new BillingDTO
            {
                id = entity.id,
                patient_id = entity.patient_id,
                issue_date = entity.issue_date,
                due_date = entity.due_date,
                total_amount = entity.total_amount,
                amount_paid = entity.amount_paid,
                status = entity.status
            };
        }

        /// <summary>
        /// Maps a BillingDTO to a Billing entity.
        /// </summary>
        public static Billing ToEntity(BillingDTO dto, HashSet<object> visited)
        {
            if (dto == null) return null;
            if (!visited.Add(dto)) return null;

            return new Billing
            {
                id = dto.id ?? Guid.NewGuid(),
                patient_id = dto.patient_id,
                issue_date = dto.issue_date,
                due_date = dto.due_date,
                total_amount = dto.total_amount,
                amount_paid = dto.amount_paid,
                status = dto.status,
                billing_line_Item = new List<BillingLineItem>(),
                payment = new List<Payment>(),
                patient = null // TODO: Set this to the appropriate Patient object if available
            };
        }
    }
}