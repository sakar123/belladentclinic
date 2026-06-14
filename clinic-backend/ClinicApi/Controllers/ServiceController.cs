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
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServices()
        {
            var services = await _serviceService.GetAllServicesAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceDTO>> GetService(Guid id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null)
                return NotFound();
                
            return Ok(service);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<ActionResult<ServiceDTO>> CreateService(ServiceDTO serviceDto)
        {
            try
            {
                var createdService = await _serviceService.CreateServiceAsync(serviceDto);
                return CreatedAtAction(nameof(GetService), new { id = createdService.id }, createdService);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(Guid id, ServiceDTO serviceDto)
        {
            try
            {
                var updatedService = await _serviceService.UpdateServiceAsync(id, serviceDto);
                return Ok(updatedService);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var result = await _serviceService.DeleteServiceAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
