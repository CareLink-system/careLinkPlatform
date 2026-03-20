using Microsoft.AspNetCore.Mvc;

namespace TelemedicineService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                service = "TelemedicineService",
                status = "Running",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
