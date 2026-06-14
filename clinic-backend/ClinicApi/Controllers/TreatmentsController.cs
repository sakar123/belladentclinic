using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AllStaff")]
    public class TreatmentsController : ControllerBase
    {
        private readonly ITreatmentService _treatmentService;

        public TreatmentsController(ITreatmentService treatmentService)
        {
            _treatmentService = treatmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TreatmentDTO>>> GetTreatments([FromQuery] Guid? patientId)
        {
            var treatments = await _treatmentService.GetAllTreatmentsAsync(patientId);
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

        [Authorize(Policy = "SupportOrAbove")]
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
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "SupportOrAbove")]
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
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
        }

        // Soft-void instead of hard delete to preserve medical records
        [Authorize(Policy = "ClinicalOrAbove")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreatment(Guid id)
        {
            try
            {
                var cancelled = await _treatmentService.CancelTreatmentAsync(id);
                return Ok(cancelled);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Explicit void endpoint (alias to cancel)
        [Authorize(Policy = "ClinicalOrAbove")]
        [HttpPost("{id}/void")]
        public async Task<ActionResult<TreatmentDTO>> VoidTreatment(Guid id)
        {
            try
            {
                var cancelled = await _treatmentService.CancelTreatmentAsync(id);
                return Ok(cancelled);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "ClinicalOrAbove")]
        [HttpPost("{id}/complete")]
        public async Task<ActionResult<TreatmentDTO>> CompleteTreatment(Guid id)
        {
            try
            {
                var completed = await _treatmentService.CompleteTreatmentAsync(id);
                return Ok(completed);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "ClinicalOrAbove")]
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult<TreatmentDTO>> CancelTreatment(Guid id)
        {
            try
            {
                var cancelled = await _treatmentService.CancelTreatmentAsync(id);
                return Ok(cancelled);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
