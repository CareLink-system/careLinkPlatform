using TelemedicineService.DTOs;
using TelemedicineService.Models;

namespace TelemedicineService.Services;

public interface ITelemedicineSessionService
{
    Task<SessionMetadataResponse> StartSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken);
    Task<SessionMetadataResponse> EndSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken);
    Task<SessionMetadataResponse> GetSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken);
    Task<SessionMetadataResponse> AddMessageAsync(string appointmentId, SessionMessageRequest request, SessionUserContext user, CancellationToken cancellationToken);
    Task<SessionMetadataResponse> AddDoctorNoteAsync(string appointmentId, DoctorSessionNoteRequest request, SessionUserContext user, CancellationToken cancellationToken);
}
