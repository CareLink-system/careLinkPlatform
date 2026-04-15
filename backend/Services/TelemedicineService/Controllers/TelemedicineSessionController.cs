using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TelemedicineService.DTOs;
using TelemedicineService.Models;
using TelemedicineService.Services;

namespace TelemedicineService.Controllers;

[ApiController]
[Authorize]
[Route("api/telemedicine/session/{appointmentId}")]
[Route("api/v1/telemedicine/session/{appointmentId}")]
public class TelemedicineSessionController : ControllerBase
{
    private readonly ITelemedicineSessionService _sessionService;

    public TelemedicineSessionController(ITelemedicineSessionService sessionService)
    {
        _sessionService = sessionService;
    }

    /// <summary>
    /// Logs the exact timestamp a doctor or patient joins the call.
    /// </summary>
    [HttpPost("start")]
    public async Task<IActionResult> StartSession(string appointmentId, CancellationToken cancellationToken)
    {
        return await ExecuteAsync(() => _sessionService.StartSessionAsync(appointmentId, CurrentUser(), cancellationToken));
    }

    /// <summary>
    /// Marks the consultation as completed and calculates call duration.
    /// </summary>
    [HttpPost("end")]
    public async Task<IActionResult> EndSession(string appointmentId, CancellationToken cancellationToken)
    {
        return await ExecuteAsync(() => _sessionService.EndSessionAsync(appointmentId, CurrentUser(), cancellationToken));
    }

    /// <summary>
    /// Retrieves call metadata for an appointment.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSession(string appointmentId, CancellationToken cancellationToken)
    {
        return await ExecuteAsync(() => _sessionService.GetSessionAsync(appointmentId, CurrentUser(), cancellationToken));
    }

    /// <summary>
    /// Saves an in-call chat message.
    /// </summary>
    [HttpPost("messages")]
    public async Task<IActionResult> AddMessage(string appointmentId, [FromBody] SessionMessageRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteAsync(() => _sessionService.AddMessageAsync(appointmentId, request, CurrentUser(), cancellationToken));
    }

    /// <summary>
    /// Saves a private doctor note for the consultation.
    /// </summary>
    [HttpPost("notes")]
    public async Task<IActionResult> AddDoctorNote(string appointmentId, [FromBody] DoctorSessionNoteRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteAsync(() => _sessionService.AddDoctorNoteAsync(appointmentId, request, CurrentUser(), cancellationToken));
    }

    private SessionUserContext CurrentUser() => SessionUserContext.FromClaims(User);

    private static async Task<IActionResult> ExecuteAsync(Func<Task<SessionMetadataResponse>> action)
    {
        try
        {
            var response = await action();
            return new OkObjectResult(response);
        }
        catch (ArgumentException ex)
        {
            return new BadRequestObjectResult(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return new ObjectResult(new { error = ex.Message }) { StatusCode = StatusCodes.Status403Forbidden };
        }
        catch (KeyNotFoundException ex)
        {
            return new NotFoundObjectResult(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return new ConflictObjectResult(new { error = ex.Message });
        }
    }
}
