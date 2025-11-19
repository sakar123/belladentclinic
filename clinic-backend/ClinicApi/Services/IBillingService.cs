using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IBillingService
    {
        Task<IEnumerable<BillingDTO>> GetAllBillingsAsync();
        Task<BillingDTO> GetBillingByIdAsync(Guid id);
        Task<BillingDTO> CreateBillingAsync(BillingDTO billingDto);
        Task<BillingDTO> UpdateBillingAsync(Guid id, BillingDTO billingDto);
        Task<bool> DeleteBillingAsync(Guid id);
    }
}
