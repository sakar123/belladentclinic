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
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;
        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDTO>>> GetPatients()
        {
            var patients = await _patientService.GetAllPatientsAsync();
            return Ok(patients);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDTO>> GetPatient(Guid id)
        {
            var patient = await _patientService.GetPatientByIdAsync(id);
            if (patient == null)
                return NotFound();
            return Ok(patient);
        }
        [HttpPost]
        public async Task<ActionResult<PatientDTO>> CreatePatient(PatientDTO patientDto)
        {
            try
            {
                var createdPatient = await _patientService.CreatePatientAsync(patientDto);
                return CreatedAtAction(nameof(GetPatient), new { id = createdPatient.id }, createdPatient);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(Guid id, PatientDTO patientDto)
        {
            try
            {
                var updatedPatient = await _patientService.UpdatePatientAsync(id, patientDto);
                return Ok(updatedPatient);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(Guid id)
        {
            var result = await _patientService.DeletePatientAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}