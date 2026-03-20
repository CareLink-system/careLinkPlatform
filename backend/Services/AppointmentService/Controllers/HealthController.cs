using Microsoft.AspNetCore.Mvc;
namespace AppointmentService.Controllers
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
                service = "AppointmentService",
                status = "Running"
            });
        }
    }
}
