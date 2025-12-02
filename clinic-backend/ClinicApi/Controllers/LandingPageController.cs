using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandingPageController : ControllerBase
    {
        private readonly ILogger<LandingPageController> _logger;
        private readonly IAppointmentService _appointmentService;

        public LandingPageController(ILogger<LandingPageController> logger, IAppointmentService appointmentService)
        {
            _logger = logger;
            _appointmentService = appointmentService;
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating an appointment from the landing page.");
                return StatusCode(500, "An internal error occurred. Please try again later.");
            }
        }
    }
}
