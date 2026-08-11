using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.EntityFrameworkCore;
namespace ClinicApi.Services.Implementations
{
    public class BillingService : IBillingService
    {
        private readonly IRepository<Billing> _billingRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Payment> _paymentRepository;
        private readonly IRepository<BillingLineItem> _lineItemRepository;
        private readonly IRepository<Service> _serviceRepository;

        public BillingService(
            IRepository<Billing> billingRepository,
            IRepository<Patient> patientRepository,
            IRepository<Payment> paymentRepository,
            IRepository<BillingLineItem> lineItemRepository,
            IRepository<Service> serviceRepository
            )
        {
            _billingRepository = billingRepository;
            _patientRepository = patientRepository;
            _paymentRepository = paymentRepository;
            _lineItemRepository = lineItemRepository;
            _serviceRepository = serviceRepository;
        }

        public async Task<IEnumerable<BillingDTO>> GetAllBillingsAsync(Guid? patientId = null)
        {
            var query = _billingRepository.GetAll();
            if (patientId.HasValue)
            {
                query = query.Where(b => b.patient_id == patientId.Value);
            }

            var list = await query
                .Select(b => new BillingDTO
                {
                    id = b.id,
                    patient_id = b.patient_id,
                    issue_date = b.issue_date,
                    due_date = b.due_date,
                    total_amount = b.total_amount,
                    amount_paid = b.amount_paid,
                    status = b.status
                })
                .ToListAsync();
            return list;
        }

        public async Task<BillingDTO> GetBillingByIdAsync(Guid id)
        {
            // Rich projection while skipping 'notes' columns to support DBs without the new column
            var dto = await _billingRepository
                .GetAll()
                .Where(b => b.id == id)
                .Select(b => new BillingDTO
                {
                    id = b.id,
                    patient_id = b.patient_id,
                    issue_date = b.issue_date,
                    due_date = b.due_date,
                    total_amount = b.total_amount,
                    amount_paid = b.amount_paid,
                    status = b.status,
                    patient_name = b.patient != null && b.patient.Person != null ? (b.patient.Person.first_name + " " + b.patient.Person.last_name) : null,
                    patient_email = b.patient != null ? b.patient.Person.email : null,
                    patient_phone = b.patient != null ? b.patient.Person.phone_number : null,
                    line_items = b.billing_line_Item
                        .Select(li => new BillingLineItemDTO
                        {
                            id = li.id,
                            billing_id = li.billing_id,
                            treatment_id = li.treatment_id,
                            service_id = li.service_id,
                            line_item_type = li.line_item_type,
                            description = li.description,
                            quantity = li.quantity,
                            unit_price = li.unit_price,
                            discount_percentage = li.discount_percentage,
                            service_name = li.service != null ? li.service.name : null,
                            treatment_notes = li.treatment != null ? li.treatment.notes : null,
                            staff_name = li.treatment != null && li.treatment.staff != null && li.treatment.staff.person != null ? (li.treatment.staff.person.first_name + " " + li.treatment.staff.person.last_name) : null,
                            appointment_id = li.treatment != null ? li.treatment.appointment_id : null
                        })
                        .ToList(),
                    payments = b.payment
                        .Select(p => new PaymentDTO
                        {
                            id = p.id,
                            billing_id = p.billing_id,
                            amount = p.amount,
                            payment_date = p.payment_date,
                            method = p.method,
                            transaction_ref = p.transaction_ref,
                            created_by = p.created_by
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return dto;
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
            if (!string.IsNullOrWhiteSpace(billingDto.status)) existingBilling.status = billingDto.status;
            existingBilling.notes = billingDto.notes;
            existingBilling.updated_at = DateTime.UtcNow;

            await _billingRepository.UpdateAsync(existingBilling);
            await _billingRepository.SaveChangesAsync();

            return existingBilling.ToDto();
        }

        public async Task<bool> DeleteBillingAsync(Guid id)
        {
            var billing = await _billingRepository.GetByIdAsync(id);
            if (billing == null)
                return false;

            await _billingRepository.DeleteAsync(billing);
            await _billingRepository.SaveChangesAsync();
            return true;
        }

        // Payments
        public async Task<PaymentDTO> AddPaymentAsync(Guid billingId, PaymentDTO paymentDto)
        {
            var billing = await _billingRepository.GetByIdAsync(billingId);
            if (billing == null) throw new KeyNotFoundException("Billing not found");

            paymentDto.billing_id = billingId;
            var payment = paymentDto.ToEntity();
            await _paymentRepository.AddAsync(payment);

            // Update billing amounts and status
            billing.amount_paid += payment.amount;
            if (billing.amount_paid >= billing.total_amount && billing.total_amount > 0)
            {
                billing.amount_paid = billing.total_amount;
                billing.status = "Paid";
            }
            else if (billing.amount_paid > 0)
            {
                billing.status = "Partial";
            }
            billing.updated_at = DateTime.UtcNow;

            await _billingRepository.UpdateAsync(billing);
            await _billingRepository.SaveChangesAsync();

            return payment.ToDto();
        }

        public async Task<IEnumerable<PaymentDTO>> GetPaymentsAsync(Guid billingId)
        {
            var payments = await _paymentRepository.FindAsync(p => p.billing_id == billingId);
            return payments.Select(p => p.ToDto()).ToList();
        }

        public async Task<bool> DeletePaymentAsync(Guid billingId, Guid paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment == null || payment.billing_id != billingId) return false;

            var billing = await _billingRepository.GetByIdAsync(billingId);
            if (billing == null) return false;

            billing.amount_paid = Math.Max(0, billing.amount_paid - payment.amount);
            billing.status = billing.amount_paid <= 0 ? "Open" : "Partial";
            billing.updated_at = DateTime.UtcNow;

            await _paymentRepository.DeleteAsync(payment);
            await _billingRepository.UpdateAsync(billing);
            await _billingRepository.SaveChangesAsync();
            return true;
        }

        // Line items
        public async Task<BillingLineItemDTO> AddLineItemAsync(Guid billingId, BillingLineItemDTO dto)
        {
            var billing = await _billingRepository.GetByIdAsync(billingId);
            if (billing == null) throw new KeyNotFoundException("Billing not found");

            if (dto.treatment_id.HasValue)
            {
                var existingTreatmentLine = (await _lineItemRepository.FindAsync(li => li.treatment_id == dto.treatment_id.Value))
                    .FirstOrDefault();
                if (existingTreatmentLine != null)
                {
                    throw new InvalidOperationException($"Treatment is already billed on invoice {existingTreatmentLine.billing_id}.");
                }
            }

            dto.billing_id = billingId;
            var item = dto.ToEntity();
            await _lineItemRepository.AddAsync(item);

            await RecalculateTotalsInternal(billing);
            await _billingRepository.SaveChangesAsync();
            return item.ToDto();
        }

        public async Task<BillingLineItemDTO> UpdateLineItemAsync(Guid billingId, Guid lineItemId, BillingLineItemDTO dto)
        {
            var item = await _lineItemRepository.GetByIdAsync(lineItemId);
            if (item == null || item.billing_id != billingId)
                throw new KeyNotFoundException("Line item not found");

            item.description = dto.description;
            item.quantity = dto.quantity;
            item.unit_price = dto.unit_price;
            item.discount_percentage = dto.discount_percentage;
            item.line_item_type = string.IsNullOrWhiteSpace(dto.line_item_type) ? item.line_item_type : dto.line_item_type!;

            await _lineItemRepository.UpdateAsync(item);
            var billing = await _billingRepository.GetByIdAsync(billingId);
            await RecalculateTotalsInternal(billing);
            await _billingRepository.SaveChangesAsync();
            return item.ToDto();
        }

        public async Task<bool> DeleteLineItemAsync(Guid billingId, Guid lineItemId)
        {
            var item = await _lineItemRepository.GetByIdAsync(lineItemId);
            if (item == null || item.billing_id != billingId) return false;

            await _lineItemRepository.DeleteAsync(item);
            var billing = await _billingRepository.GetByIdAsync(billingId);
            await RecalculateTotalsInternal(billing);
            await _billingRepository.SaveChangesAsync();
            return true;
        }

        public async Task<BillingDTO> ApplyDiscountAsync(Guid billingId, decimal discountPercentage)
        {
            var billing = await _billingRepository
                .GetAll()
                .Include(b => b.billing_line_Item)
                .FirstOrDefaultAsync(b => b.id == billingId);
            if (billing == null) throw new KeyNotFoundException("Billing not found");

            foreach (var item in billing.billing_line_Item)
            {
                item.discount_percentage = discountPercentage;
                await _lineItemRepository.UpdateAsync(item);
            }

            await RecalculateTotalsInternal(billing);
            await _billingRepository.SaveChangesAsync();
            return billing.ToDto();
        }

        public async Task<BillingDTO> RecalculateTotalsAsync(Guid billingId)
        {
            var billing = await _billingRepository.GetByIdAsync(billingId);
            if (billing == null) throw new KeyNotFoundException("Billing not found");
            await RecalculateTotalsInternal(billing);
            await _billingRepository.SaveChangesAsync();
            return billing.ToDto();
        }

        private async Task RecalculateTotalsInternal(Billing billing)
        {
            if (billing == null) return;
            var items = await _lineItemRepository.FindAsync(li => li.billing_id == billing.id);
            decimal total = 0m;
            foreach (var item in items)
            {
                var lineTotal = item.quantity * item.unit_price;
                var discount = lineTotal * (item.discount_percentage / 100m);
                total += (lineTotal - discount);
            }
            billing.total_amount = total;
            if (billing.amount_paid >= billing.total_amount && billing.total_amount > 0)
                billing.status = "Paid";
            else if (billing.amount_paid > 0)
                billing.status = "Partial";
            billing.updated_at = DateTime.UtcNow;
            await _billingRepository.UpdateAsync(billing);
        }
    }
}
