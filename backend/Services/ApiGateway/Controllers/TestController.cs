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
            routes = new[]
            {
                "/api/auth/* → AuthService (5001)",
                "/api/patients/* → PatientService (5002)",
                "/api/doctors/* → DoctorService (5003)",
                "/api/appointments/* → AppointmentService (5004)",
                "/api/telemedicine/* → TelemedicineService (5007)",
                "/api/payments/* → PaymentService (5010)",
                "/api/notifications/* → NotificationService (5008)"
            }
        });
    }
}