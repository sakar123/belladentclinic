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
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDTO>>> GetRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDTO>> GetRole(Guid id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<RoleDTO>> CreateRole(RoleDTO roleDto)
        {
            try
            {
                var createdRole = await _roleService.CreateRoleAsync(roleDto);
                return CreatedAtAction(nameof(GetRole), new { id = createdRole.id }, createdRole);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, RoleDTO roleDto)
        {
            try
            {
                var updatedRole = await _roleService.UpdateRoleAsync(id, roleDto);
                return Ok(updatedRole);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var result = await _roleService.DeleteRoleAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
