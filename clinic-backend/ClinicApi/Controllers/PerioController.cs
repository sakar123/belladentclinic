using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SupportOrAbove")]
    public class PerioController : ControllerBase
    {
        private readonly IPerioService _perioService;

        public PerioController(IPerioService perioService)
        {
            _perioService = perioService;
        }

        [HttpGet("latest")] 
        public async Task<ActionResult<PerioStatusDTO?>> GetLatest([FromQuery] Guid patientId)
        {
            if (patientId == Guid.Empty) return BadRequest("patientId is required");
            var dto = await _perioService.GetLatestAsync(patientId);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<PerioStatusDTO>> Create(CreatePerioRequest request)
        {
            var created = await _perioService.CreateAsync(request);
            return CreatedAtAction(nameof(GetLatest), new { patientId = created.patient_id }, created);
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<PerioStatisticsDTO>> GetStatistics([FromQuery] Guid patientId)
        {
            if (patientId == Guid.Empty) return BadRequest("patientId is required");
            var stats = await _perioService.GetStatisticsAsync(patientId);
            return Ok(stats);
        }
    }
}
