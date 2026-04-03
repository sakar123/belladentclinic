using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Services;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationDispatchController : ControllerBase
    {
        private readonly INotificationOrchestrator _orchestrator;

        public NotificationDispatchController(INotificationOrchestrator orchestrator)
        {
            _orchestrator = orchestrator;
        }

        /// <summary>
        /// Dispatch a notification for one or more persons.
        /// Creates notification + recipient records in Queued state.
        /// Does not send — a worker handles actual delivery.
        /// </summary>
        [HttpPost("dispatch")]
        public async Task<ActionResult<DispatchNotificationResponse>> Dispatch(DispatchNotificationRequest request)
        {
            try
            {
                var result = await _orchestrator.DispatchAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }
    }
}
