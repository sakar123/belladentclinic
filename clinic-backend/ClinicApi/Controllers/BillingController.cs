using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;

        public BillingController(IBillingService billingService)
        {
            _billingService = billingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BillingDTO>>> GetBillings()
        {
            var billings = await _billingService.GetAllBillingsAsync();
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBilling(Guid id)
        {
            var result = await _billingService.DeleteBillingAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
