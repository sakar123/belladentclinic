using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClinicApi.Data.Repositories;
using ClinicApi.Mappers;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize(Policy = "AllStaff")]
    public class NotificationDispatchController : ControllerBase
    {
        private readonly INotificationOrchestrator _orchestrator;
        private readonly IRepository<NotificationTopic> _topicRepository;

        public NotificationDispatchController(
            INotificationOrchestrator orchestrator,
            IRepository<NotificationTopic> topicRepository)
        {
            _orchestrator = orchestrator;
            _topicRepository = topicRepository;
        }

        [HttpGet("topics")]
        public async Task<ActionResult> GetTopics()
        {
            var topics = await _topicRepository.GetAll()
                .Where(t => t.is_active)
                .OrderBy(t => t.name)
                .ToListAsync();
            return Ok(topics.Select(t => NotificationTopicMapper.ToDto(t)));
        }

        /// <summary>
        /// Dispatch a notification for one or more persons.
        /// Creates notification + recipient records in Queued state.
        /// Does not send — a worker handles actual delivery.
        /// </summary>
        [Authorize(Policy = "AdminOnly")]
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
