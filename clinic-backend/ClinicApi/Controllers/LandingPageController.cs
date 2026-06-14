using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("DevCors")]
    [AllowAnonymous]
    public class LandingPageController : ControllerBase
    {
        private readonly ILogger<LandingPageController> _logger;
        private readonly IAppointmentService _appointmentService;
        private readonly IGoogleReviewsService _googleReviewsService;

        public LandingPageController(
            ILogger<LandingPageController> logger,
            IAppointmentService appointmentService,
            IGoogleReviewsService googleReviewsService)
        {
            _logger = logger;
            _appointmentService = appointmentService;
            _googleReviewsService = googleReviewsService;
        }

        [HttpGet("reviews")]
        public async Task<IActionResult> GetReviews()
        {
            _logger.LogInformation("Fetching Google Reviews for landing page.");
            try
            {
                var reviews = await _googleReviewsService.GetReviewsAsync();
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching Google Reviews.");
                return StatusCode(500, "An internal error occurred. Please try again later.");
            }
        }

        // Explicit OPTIONS endpoints to satisfy cross-origin preflight requests
        [HttpOptions("reviews")]
        public IActionResult OptionsReviews()
        {
            return NoContent();
        }

        [HttpPost("appointment")]
        public async Task<IActionResult> CreateAppointmentAsync([FromBody] LandingPageAppointmentRequestDto request)
        {
            _logger.LogInformation("Received new appointment request from landing page for {FullName}", request.FullName);

            try
            {
                var createdAppointment = await _appointmentService.CreateAppointmentFromLandingPageAsync(request);
                // Returning a simplified response for the landing page client
                var response = new 
                {
                    Message = "Appointment request received successfully. We will contact you shortly to confirm.",
                    AppointmentId = createdAppointment.id
                };
                return StatusCode(201, response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid landing page request payload.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Cannot create appointment due to missing data/state.");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating an appointment from the landing page.");
                return StatusCode(500, "An internal error occurred. Please try again later.");
            }
        }

        [HttpOptions("appointment")]
        public IActionResult OptionsAppointment()
        {
            return NoContent();
        }
    }
}
