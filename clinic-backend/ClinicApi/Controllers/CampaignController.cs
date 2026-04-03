using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.DTOs.Notifications;
using ClinicApi.Services;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/campaigns")]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignManager _campaignManager;

        public CampaignController(ICampaignManager campaignManager)
        {
            _campaignManager = campaignManager;
        }

        /// <summary>
        /// Preview campaign audience without creating anything.
        /// Shows matched/eligible/excluded counts and a sample of recipients.
        /// </summary>
        [HttpPost("preview")]
        public async Task<ActionResult<CampaignPreviewResponse>> Preview(CampaignPreviewRequest request)
        {
            try
            {
                var result = await _campaignManager.PreviewAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Create a campaign record (Draft or Scheduled). Does not send.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CreateCampaignResponse>> Create(CreateCampaignRequest request)
        {
            try
            {
                var result = await _campaignManager.CreateAsync(request);
                return CreatedAtAction(nameof(Get), new { campaignId = result.campaign_id }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Launch a draft/scheduled campaign: resolve audience, create notification records, queue for delivery.
        /// </summary>
        [HttpPost("{campaignId}/launch")]
        public async Task<ActionResult<DispatchNotificationResponse>> Launch(Guid campaignId)
        {
            try
            {
                var result = await _campaignManager.LaunchAsync(campaignId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get campaign details.
        /// </summary>
        [HttpGet("{campaignId}")]
        public async Task<ActionResult<CampaignDetailResponse>> Get(Guid campaignId)
        {
            try
            {
                var result = await _campaignManager.GetAsync(campaignId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Get campaign delivery stats (targeted, sent, delivered, bounced, etc.)
        /// </summary>
        [HttpGet("{campaignId}/stats")]
        public async Task<ActionResult<CampaignStatsResponse>> GetStats(Guid campaignId)
        {
            try
            {
                var result = await _campaignManager.GetStatsAsync(campaignId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
