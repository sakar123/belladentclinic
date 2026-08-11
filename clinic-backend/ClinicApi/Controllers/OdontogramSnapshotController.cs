using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/patients/{patientId:guid}/odontogram-snapshot")]
    [Authorize(Policy = "AllStaff")]
    public class OdontogramSnapshotController : ControllerBase
    {
        private readonly IOdontogramSnapshotService _snapshotService;

        public OdontogramSnapshotController(IOdontogramSnapshotService snapshotService)
        {
            _snapshotService = snapshotService;
        }

        [HttpGet]
        public async Task<ActionResult<OdontogramSnapshotDTO>> Get(Guid patientId)
        {
            var snapshot = await _snapshotService.GetLatestAsync(patientId);
            return snapshot == null ? NotFound() : Ok(snapshot);
        }

        [Authorize(Policy = "SupportOrAbove")]
        [HttpPut]
        public async Task<ActionResult<OdontogramSnapshotDTO>> Upsert(Guid patientId, SaveOdontogramSnapshotRequest request)
        {
            try
            {
                var snapshot = await _snapshotService.UpsertAsync(patientId, request);
                return Ok(snapshot);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
