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
    public class TreatmentsController : ControllerBase
    {
        private readonly ITreatmentService _treatmentService;

        public TreatmentsController(ITreatmentService treatmentService)
        {
            _treatmentService = treatmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TreatmentDTO>>> GetTreatments()
        {
            var treatments = await _treatmentService.GetAllTreatmentsAsync();
            return Ok(treatments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TreatmentDTO>> GetTreatment(Guid id)
        {
            var treatment = await _treatmentService.GetTreatmentByIdAsync(id);
            if (treatment == null)
                return NotFound();
                
            return Ok(treatment);
        }

        [HttpPost]
        public async Task<ActionResult<TreatmentDTO>> CreateTreatment(TreatmentDTO treatmentDto)
        {
            try
            {
                var createdTreatment = await _treatmentService.CreateTreatmentAsync(treatmentDto);
                return CreatedAtAction(nameof(GetTreatment), new { id = createdTreatment.id }, createdTreatment);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTreatment(Guid id, TreatmentDTO treatmentDto)
        {
            try
            {
                var updatedTreatment = await _treatmentService.UpdateTreatmentAsync(id, treatmentDto);
                return Ok(updatedTreatment);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreatment(Guid id)
        {
            var result = await _treatmentService.DeleteTreatmentAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
