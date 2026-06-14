using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IBillingService
    {
        Task<IEnumerable<BillingDTO>> GetAllBillingsAsync(Guid? patientId = null);
        Task<BillingDTO> GetBillingByIdAsync(Guid id);
        Task<BillingDTO> CreateBillingAsync(BillingDTO billingDto);
        Task<BillingDTO> UpdateBillingAsync(Guid id, BillingDTO billingDto);
        Task<bool> DeleteBillingAsync(Guid id);

        // Payments
        Task<PaymentDTO> AddPaymentAsync(Guid billingId, PaymentDTO paymentDto);
        Task<IEnumerable<PaymentDTO>> GetPaymentsAsync(Guid billingId);
        Task<bool> DeletePaymentAsync(Guid billingId, Guid paymentId);

        // Line items
        Task<BillingLineItemDTO> AddLineItemAsync(Guid billingId, BillingLineItemDTO dto);
        Task<BillingLineItemDTO> UpdateLineItemAsync(Guid billingId, Guid lineItemId, BillingLineItemDTO dto);
        Task<bool> DeleteLineItemAsync(Guid billingId, Guid lineItemId);

        // Discounts / totals
        Task<BillingDTO> ApplyDiscountAsync(Guid billingId, decimal discountPercentage);
        Task<BillingDTO> RecalculateTotalsAsync(Guid billingId);
    }
}
