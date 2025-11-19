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
    public class TeethController : ControllerBase
    {
        private readonly IToothService _toothService;

        public TeethController(IToothService toothService)
        {
            _toothService = toothService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToothDTO>>> GetTeeth()
        {
            var teeth = await _toothService.GetAllTeethAsync();
            return Ok(teeth);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ToothDTO>> GetTooth(Guid id)
        {
            var tooth = await _toothService.GetToothByIdAsync(id);
            if (tooth == null)
                return NotFound();
                
            return Ok(tooth);
        }

        [HttpPost]
        public async Task<ActionResult<ToothDTO>> CreateTooth(ToothDTO toothDto)
        {
            try
            {
                var createdTooth = await _toothService.CreateToothAsync(toothDto);
                return CreatedAtAction(nameof(GetTooth), new { id = createdTooth.id }, createdTooth);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTooth(Guid id, ToothDTO toothDto)
        {
            try
            {
                var updatedTooth = await _toothService.UpdateToothAsync(id, toothDto);
                return Ok(updatedTooth);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTooth(Guid id)
        {
            var result = await _toothService.DeleteToothAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
