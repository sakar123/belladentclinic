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
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDTO>>> GetStaff()
        {
            var staff = await _staffService.GetAllStaffAsync();
            return Ok(staff);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDTO>> GetStaff(Guid id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null)
                return NotFound();
            return Ok(staff);
        }
        [HttpPost]
        public async Task<ActionResult<StaffDTO>> CreateStaff(StaffDTO staffDto)
        {
            try
            {
                var createdStaff = await _staffService.CreateStaffAsync(staffDto);
                return CreatedAtAction(nameof(GetStaff), new { id = createdStaff.id }, createdStaff);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(Guid id, StaffDTO staffDto)
        {
            try
            {
                var updatedStaff = await _staffService.UpdateStaffAsync(id, staffDto);
                return Ok(updatedStaff);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(Guid id)
        {
            try
            {
                var result = await _staffService.DeleteStaffAsync(id);
                if (!result)
                    return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }
    }
}
