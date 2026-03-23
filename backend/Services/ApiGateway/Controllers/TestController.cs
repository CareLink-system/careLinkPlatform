using Microsoft.AspNetCore.Mvc;

namespace ApiGateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "API Gateway is running!",
            timestamp = DateTime.UtcNow,
            services = new[]
            {
                "POST   /api/auth/register",
                "POST   /api/auth/login",
                "GET    /api/patients/profile",
                "GET    /api/doctors/availability",
                "POST   /api/appointments/book",
                "POST   /api/payments/initiate"
            }
        });
    }
}