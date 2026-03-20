using Microsoft.AspNetCore.Mvc;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "DoctorService",
            status = "Running"
        });
    }
}