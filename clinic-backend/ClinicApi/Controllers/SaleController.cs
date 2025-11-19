using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaleController : ControllerBase
    {
        private readonly ISaleService _saleService;

        public SaleController(ISaleService saleService)
        {
            _saleService = saleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleItemDTO>>> GetSaleItems()
        {
            var saleItems = await _saleService.GetAllSaleItemsAsync();
            return Ok(saleItems);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SaleItemDTO>> GetSaleItem(Guid id)
        {
            var saleItem = await _saleService.GetSaleItemByIdAsync(id);
            if (saleItem == null)
                return NotFound();
                
            return Ok(saleItem);
        }

        [HttpPost]
        public async Task<ActionResult<SaleItemDTO>> CreateSaleItem(SaleItemDTO saleItemDto)
        {
            try
            {
                var createdSaleItem = await _saleService.CreateSaleItemAsync(saleItemDto);
                return CreatedAtAction(nameof(GetSaleItem), new { id = createdSaleItem.id }, createdSaleItem);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSaleItem(Guid id, SaleItemDTO saleItemDto)
        {
            try
            {
                var updatedSaleItem = await _saleService.UpdateSaleItemAsync(id, saleItemDto);
                return Ok(updatedSaleItem);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSaleItem(Guid id)
        {
            var result = await _saleService.DeleteSaleItemAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
