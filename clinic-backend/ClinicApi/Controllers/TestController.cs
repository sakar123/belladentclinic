using ClinicApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class TestController : ControllerBase
    {
        private readonly DentalClinicContext _context;

        public TestController(DentalClinicContext context)
        {
            _context = context;
        }

        [HttpPost("seed")]
        public IActionResult SeedData()
        {
            _context.SeedData();
            _context.SaveChanges();
            return Ok("Test data seeded successfully.");
        }
    }
}
