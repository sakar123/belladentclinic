using ClinicApi.Data;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
