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
    public class SpecialtyController : ControllerBase
    {
        private readonly ISpecialtyService _specialtyService;

        public SpecialtyController(ISpecialtyService specialtyService)
        {
            _specialtyService = specialtyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpecialtyDTO>>> GetSpecialties()
        {
            var specialties = await _specialtyService.GetAllSpecialtiesAsync();
            return Ok(specialties);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SpecialtyDTO>> GetSpecialty(Guid id)
        {
            var specialty = await _specialtyService.GetSpecialtyByIdAsync(id);
            if (specialty == null)
                return NotFound();
            return Ok(specialty);
        }

        [HttpPost]
        public async Task<ActionResult<SpecialtyDTO>> CreateSpecialty(SpecialtyDTO specialtyDto)
        {
            try
            {
                var createdSpecialty = await _specialtyService.CreateSpecialtyAsync(specialtyDto);
                return CreatedAtAction(nameof(GetSpecialty), new { id = createdSpecialty.id }, createdSpecialty);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpecialty(Guid id, SpecialtyDTO specialtyDto)
        {
            try
            {
                var updatedSpecialty = await _specialtyService.UpdateSpecialtyAsync(id, specialtyDto);
                return Ok(updatedSpecialty);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecialty(Guid id)
        {
            var result = await _specialtyService.DeleteSpecialtyAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
