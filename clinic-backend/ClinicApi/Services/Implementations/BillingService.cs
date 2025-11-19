using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
namespace ClinicApi.Services.Implementations
{
    public class BillingService : IBillingService
    {
        private readonly IRepository<Billing> _billingRepository;
        private readonly IRepository<Patient> _patientRepository;

        public BillingService(
            IRepository<Billing> billingRepository,
            IRepository<Patient> patientRepository
            )
        {
            _billingRepository = billingRepository;
            _patientRepository = patientRepository;
        }

        public async Task<IEnumerable<BillingDTO>> GetAllBillingsAsync()
        {
            var billings = await _billingRepository.GetAllAsync();
            return billings.Select(b => b.ToDto()).ToList();
        }

        public async Task<BillingDTO> GetBillingByIdAsync(Guid id)
        {
            var billing = await _billingRepository.GetByIdAsync(id);
            return billing?.ToDto();
        }
        public async Task<BillingDTO> CreateBillingAsync(BillingDTO billingDto)
        {
            // Validate related entities exist
            if (!await _patientRepository.ExistsAsync(billingDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            // Use ToEntity() extension method
            var billing = billingDto.ToEntity();
            await _billingRepository.AddAsync(billing);
            await _billingRepository.SaveChangesAsync();

            return billing.ToDto();
        }

        public async Task<BillingDTO> UpdateBillingAsync(Guid id, BillingDTO billingDto)
        {
            var existingBilling = await _billingRepository.GetByIdAsync(id);
            if (existingBilling == null)
                throw new KeyNotFoundException("Billing not found");

            // Validate patient exists if changed
            if (existingBilling.patient_id != billingDto.patient_id &&
                !await _patientRepository.ExistsAsync(billingDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            // Manually update properties
            existingBilling.patient_id = billingDto.patient_id;
            existingBilling.total_amount = billingDto.total_amount;
            existingBilling.amount_paid = billingDto.amount_paid;
            existingBilling.due_date = billingDto.due_date;
            existingBilling.updated_at = DateTime.UtcNow;

            _billingRepository.Update(existingBilling);
            await _billingRepository.SaveChangesAsync();

            return existingBilling.ToDto();
        }

        public async Task<bool> DeleteBillingAsync(Guid id)
        {
            var billing = await _billingRepository.GetByIdAsync(id);
            if (billing == null)
                return false;

            _billingRepository.Delete(billing);
            await _billingRepository.SaveChangesAsync();
            return true;
        }
    }
}
