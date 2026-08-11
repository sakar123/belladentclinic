using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/patients/{patientId:guid}")]
    [Authorize(Policy = "AllStaff")]
    public class AdvancedOdontogramController : ControllerBase
    {
        private readonly IAdvancedOdontogramService _odontogramService;

        public AdvancedOdontogramController(IAdvancedOdontogramService odontogramService)
        {
            _odontogramService = odontogramService;
        }

        [HttpGet("odontogram-state")]
        public async Task<ActionResult<AdvancedOdontogramStateDTO>> GetState(Guid patientId)
        {
            try
            {
                return Ok(await _odontogramService.GetStateAsync(patientId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "SupportOrAbove")]
        [HttpPut("odontogram-state")]
        public async Task<ActionResult<AdvancedOdontogramStateDTO>> SaveState(
            Guid patientId,
            SaveAdvancedOdontogramStateRequest request,
            [FromHeader(Name = "If-Match")] string? ifMatch)
        {
            try
            {
                return Ok(await _odontogramService.SaveStateAsync(patientId, request, ifMatch, UserKey()));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (OdontogramConcurrencyException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (OdontogramSchemaUnavailableException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
            catch (OdontogramValidationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "ClinicalOrAbove")]
        [HttpPost("odontogram-plan/commit")]
        public async Task<ActionResult<AdvancedOdontogramStateDTO>> CommitPlan(Guid patientId, CommitOdontogramPlanRequest request)
        {
            try
            {
                return Ok(await _odontogramService.CommitPlanAsync(patientId, request, UserKey()));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (OdontogramValidationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
            catch (OdontogramSchemaUnavailableException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "SupportOrAbove")]
        [HttpPost("odontogram-plan/{planItemId:guid}/dismiss")]
        public async Task<ActionResult<OdontogramPlanItemDTO>> DismissPlanItem(Guid patientId, Guid planItemId)
        {
            try
            {
                return Ok(await _odontogramService.DismissPlanItemAsync(patientId, planItemId, UserKey()));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        private string? UserKey()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? User.Identity?.Name;
        }
    }
}
