using TelemedicineService.Clients;
using TelemedicineService.DTOs;
using TelemedicineService.Models;
using TelemedicineService.Repositories;

namespace TelemedicineService.Services;

public class TelemedicineSessionService : ITelemedicineSessionService
{
    private readonly ITelemedicineSessionRepository _repository;
    private readonly IAppointmentLookupClient _appointmentLookup;

    public TelemedicineSessionService(
        ITelemedicineSessionRepository repository,
        IAppointmentLookupClient appointmentLookup)
    {
        _repository = repository;
        _appointmentLookup = appointmentLookup;
    }

    public async Task<SessionMetadataResponse> StartSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken)
    {
        var appointment = await GetAuthorizedAppointmentAsync(appointmentId, user, cancellationToken);

        var session = await _repository.GetByAppointmentIdAsync(appointmentId, cancellationToken)
            ?? CreateNewSession(appointmentId, appointment);

        var now = DateTime.UtcNow;

        if (session.StartedAtUtc is null)
        {
            session.StartedAtUtc = now;
            session.Status = "InProgress";
        }

        var participant = session.Participants.FirstOrDefault(x => x.UserId == user.UserId);
        if (participant is null)
        {
            participant = new SessionParticipant
            {
                UserId = user.UserId,
                Role = user.Role,
                DisplayName = user.DisplayName,
                FirstJoinedAtUtc = now,
                LastJoinedAtUtc = now,
                LeftAtUtc = null,
                JoinEventsUtc = new List<DateTime> { now }
            };
            session.Participants.Add(participant);
        }
        else
        {
            participant.Role = user.Role;
            participant.DisplayName = user.DisplayName;
            participant.FirstJoinedAtUtc ??= now;
            participant.LastJoinedAtUtc = now;
            participant.LeftAtUtc = null;
            participant.JoinEventsUtc.Add(now);
        }

        await _repository.UpsertAsync(session, cancellationToken);
        return ToMetadata(session, appointment);
    }

    public async Task<SessionMetadataResponse> EndSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken)
    {
        var appointment = await GetAuthorizedAppointmentAsync(appointmentId, user, cancellationToken);

        var session = await _repository.GetByAppointmentIdAsync(appointmentId, cancellationToken)
            ?? throw new KeyNotFoundException("No session exists for this appointment.");

        var now = DateTime.UtcNow;
        var participant = session.Participants.FirstOrDefault(x => x.UserId == user.UserId);
        if (participant is not null)
        {
            participant.LeftAtUtc = now;
        }

        session.EndedAtUtc ??= now;
        if (session.StartedAtUtc is not null)
        {
            session.DurationSeconds = Math.Max(0, Convert.ToInt64((session.EndedAtUtc.Value - session.StartedAtUtc.Value).TotalSeconds));
        }

        session.Status = "Completed";

        await _repository.UpsertAsync(session, cancellationToken);
        return ToMetadata(session, appointment);
    }

    public async Task<SessionMetadataResponse> GetSessionAsync(string appointmentId, SessionUserContext user, CancellationToken cancellationToken)
    {
        var appointment = await GetAuthorizedAppointmentAsync(appointmentId, user, cancellationToken);

        var session = await _repository.GetByAppointmentIdAsync(appointmentId, cancellationToken)
            ?? throw new KeyNotFoundException("No session exists for this appointment.");

        return ToMetadata(session, appointment);
    }

    public async Task<SessionMetadataResponse> AddMessageAsync(
        string appointmentId,
        SessionMessageRequest request,
        SessionUserContext user,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            throw new ArgumentException("Message cannot be empty.");
        }

        var appointment = await GetAuthorizedAppointmentAsync(appointmentId, user, cancellationToken);

        var session = await _repository.GetByAppointmentIdAsync(appointmentId, cancellationToken)
            ?? CreateNewSession(appointmentId, appointment);

        session.Messages.Add(new SessionMessage
        {
            SenderUserId = user.UserId,
            SenderRole = user.Role,
            SenderDisplayName = user.DisplayName,
            Message = request.Message.Trim(),
            SentAtUtc = DateTime.UtcNow
        });

        await _repository.UpsertAsync(session, cancellationToken);
        return ToMetadata(session, appointment);
    }

    public async Task<SessionMetadataResponse> AddDoctorNoteAsync(
        string appointmentId,
        DoctorSessionNoteRequest request,
        SessionUserContext user,
        CancellationToken cancellationToken)
    {
        if (!user.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Only doctors can save consultation notes.");
        }

        if (string.IsNullOrWhiteSpace(request.Note))
        {
            throw new ArgumentException("Note cannot be empty.");
        }

        var appointment = await GetAuthorizedAppointmentAsync(appointmentId, user, cancellationToken);

        var session = await _repository.GetByAppointmentIdAsync(appointmentId, cancellationToken)
            ?? CreateNewSession(appointmentId, appointment);

        session.DoctorNotes.Add(new DoctorSessionNote
        {
            DoctorUserId = user.UserId,
            Note = request.Note.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        });

        await _repository.UpsertAsync(session, cancellationToken);
        return ToMetadata(session, appointment);
    }

    private async Task<AppointmentSnapshot> GetAuthorizedAppointmentAsync(
        string appointmentId,
        SessionUserContext user,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(user.UserId))
        {
            throw new UnauthorizedAccessException("Authenticated user identity is required.");
        }

        if (!int.TryParse(appointmentId, out var appointmentNumericId))
        {
            throw new ArgumentException("appointmentId must be a valid numeric appointment id.");
        }

        var appointment = await _appointmentLookup.GetAppointmentAsync(appointmentNumericId, cancellationToken)
            ?? throw new KeyNotFoundException("Appointment not found.");

        if (!IsAllowedRole(user.Role))
        {
            throw new UnauthorizedAccessException("Only doctor, patient, or admin users can access telemedicine sessions.");
        }

        if (user.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            if (user.DoctorId is null || user.DoctorId.Value != appointment.DoctorId)
            {
                throw new UnauthorizedAccessException("Doctor is not assigned to this appointment.");
            }
        }

        if (user.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            if (user.PatientId is null || user.PatientId.Value != appointment.PatientId)
            {
                throw new UnauthorizedAccessException("Patient is not assigned to this appointment.");
            }
        }

        if (appointment.AppointmentStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("This appointment has been cancelled and cannot be used for telemedicine.");
        }

        return appointment;
    }

    private static bool IsAllowedRole(string role)
        => role.Equals("Doctor", StringComparison.OrdinalIgnoreCase)
           || role.Equals("Patient", StringComparison.OrdinalIgnoreCase)
           || role.Equals("Admin", StringComparison.OrdinalIgnoreCase);

    private static TelemedicineSession CreateNewSession(string appointmentId, AppointmentSnapshot appointment)
    {
        return new TelemedicineSession
        {
            AppointmentId = appointmentId,
            AppointmentNumericId = appointment.Id,
            DoctorId = appointment.DoctorId,
            PatientId = appointment.PatientId,
            AgoraChannelName = appointmentId,
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }

    private static SessionMetadataResponse ToMetadata(TelemedicineSession session, AppointmentSnapshot appointment)
    {
        return new SessionMetadataResponse
        {
            AppointmentId = session.AppointmentId,
            AgoraChannelName = session.AgoraChannelName,
            Status = session.Status,
            StartedAtUtc = session.StartedAtUtc,
            EndedAtUtc = session.EndedAtUtc,
            DurationSeconds = session.DurationSeconds,
            AppointmentStatus = appointment.AppointmentStatus,
            AppointmentDate = appointment.AppointmentDate,
            TimeSlot = appointment.TimeSlot,
            Participants = session.Participants
                .Select(x => new SessionParticipantResponse
                {
                    UserId = x.UserId,
                    Role = x.Role,
                    DisplayName = x.DisplayName,
                    FirstJoinedAtUtc = x.FirstJoinedAtUtc,
                    LastJoinedAtUtc = x.LastJoinedAtUtc,
                    LeftAtUtc = x.LeftAtUtc,
                    JoinEventsUtc = x.JoinEventsUtc
                })
                .ToArray(),
            MessageCount = session.Messages.Count,
            DoctorNoteCount = session.DoctorNotes.Count
        };
    }
}
