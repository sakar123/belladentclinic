using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AllStaff")]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;

        public BillingController(IBillingService billingService)
        {
            _billingService = billingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillingDTO>>> GetBillings([FromQuery] Guid? patientId)
        {
            var billings = await _billingService.GetAllBillingsAsync(patientId);
            return Ok(billings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BillingDTO>> GetBilling(Guid id)
        {
            var billing = await _billingService.GetBillingByIdAsync(id);
            if (billing == null)
                return NotFound();
                
            return Ok(billing);
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpPost]
        public async Task<ActionResult<BillingDTO>> CreateBilling(BillingDTO billingDto)
        {
            try
            {
                var createdBilling = await _billingService.CreateBillingAsync(billingDto);
                return CreatedAtAction(nameof(GetBilling), new { id = createdBilling.id }, createdBilling);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBilling(Guid id, BillingDTO billingDto)
        {
            try
            {
                var updatedBilling = await _billingService.UpdateBillingAsync(id, billingDto);
                return Ok(updatedBilling);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBilling(Guid id)
        {
            var result = await _billingService.DeleteBillingAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }

        // === Payment sub-resource ===
        [Authorize(Policy = "BillingStaff")]
        [HttpGet("{billingId}/payments")]
        public async Task<ActionResult<IEnumerable<PaymentDTO>>> GetPayments(Guid billingId)
        {
            var payments = await _billingService.GetPaymentsAsync(billingId);
            return Ok(payments);
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpPost("{billingId}/payments")]
        public async Task<ActionResult<PaymentDTO>> AddPayment(Guid billingId, PaymentDTO paymentDto)
        {
            try
            {
                var payment = await _billingService.AddPaymentAsync(billingId, paymentDto);
                return CreatedAtAction(nameof(GetBilling), new { id = billingId }, payment);
            }
            catch (KeyNotFoundException ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpDelete("{billingId}/payments/{paymentId}")]
        public async Task<IActionResult> DeletePayment(Guid billingId, Guid paymentId)
        {
            var result = await _billingService.DeletePaymentAsync(billingId, paymentId);
            if (!result) return NotFound();
            return NoContent();
        }

        // === Line item sub-resource ===
        [Authorize(Policy = "BillingStaff")]
        [HttpPost("{billingId}/line-items")]
        public async Task<ActionResult<BillingLineItemDTO>> AddLineItem(Guid billingId, BillingLineItemDTO dto)
        {
            try
            {
                var item = await _billingService.AddLineItemAsync(billingId, dto);
                return CreatedAtAction(nameof(GetBilling), new { id = billingId }, item);
            }
            catch (KeyNotFoundException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpPut("{billingId}/line-items/{lineItemId}")]
        public async Task<ActionResult<BillingLineItemDTO>> UpdateLineItem(Guid billingId, Guid lineItemId, BillingLineItemDTO dto)
        {
            try
            {
                var item = await _billingService.UpdateLineItemAsync(billingId, lineItemId, dto);
                return Ok(item);
            }
            catch (KeyNotFoundException ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpDelete("{billingId}/line-items/{lineItemId}")]
        public async Task<IActionResult> DeleteLineItem(Guid billingId, Guid lineItemId)
        {
            var result = await _billingService.DeleteLineItemAsync(billingId, lineItemId);
            if (!result) return NotFound();
            return NoContent();
        }

        // === Discount/Total ===
        [Authorize(Policy = "AdminOnly")]
        [HttpPost("{billingId}/apply-discount")]
        public async Task<ActionResult<BillingDTO>> ApplyDiscount(Guid billingId, [FromBody] decimal discountPercentage)
        {
            try
            {
                var result = await _billingService.ApplyDiscountAsync(billingId, discountPercentage);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Policy = "BillingStaff")]
        [HttpPost("{billingId}/recalculate")]
        public async Task<ActionResult<BillingDTO>> Recalculate(Guid billingId)
        {
            try
            {
                var result = await _billingService.RecalculateTotalsAsync(billingId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return BadRequest(ex.Message); }
        }
    }
}
