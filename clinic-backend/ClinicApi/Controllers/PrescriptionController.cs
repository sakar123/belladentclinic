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
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PrescriptionDTO>>> GetPrescriptions()
        {
            var prescriptions = await _prescriptionService.GetAllPrescriptionsAsync();
            return Ok(prescriptions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PrescriptionDTO>> GetPrescription(Guid id)
        {
            var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id);
            if (prescription == null)
                return NotFound();
                
            return Ok(prescription);
        }

        [HttpPost]
        public async Task<ActionResult<PrescriptionDTO>> CreatePrescription(PrescriptionDTO prescriptionDto)
        {
            try
            {
                var createdPrescription = await _prescriptionService.CreatePrescriptionAsync(prescriptionDto);
                return CreatedAtAction(nameof(GetPrescription), new { id = createdPrescription.id }, createdPrescription);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrescription(Guid id, PrescriptionDTO prescriptionDto)
        {
            try
            {
                var updatedPrescription = await _prescriptionService.UpdatePrescriptionAsync(id, prescriptionDto);
                return Ok(updatedPrescription);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrescription(Guid id)
        {
            var result = await _prescriptionService.DeletePrescriptionAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
