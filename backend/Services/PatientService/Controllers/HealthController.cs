using Microsoft.AspNetCore.Mvc;

namespace PatientService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "PatientService",
            status = "Running",
            timestamp = DateTime.UtcNow
        });
    }
}