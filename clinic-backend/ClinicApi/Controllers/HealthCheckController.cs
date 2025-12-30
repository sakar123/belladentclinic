using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthCheckController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Healthy");
        }
    }
}
