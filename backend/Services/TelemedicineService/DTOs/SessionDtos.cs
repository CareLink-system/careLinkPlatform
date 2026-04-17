namespace TelemedicineService.DTOs;

public class SessionMessageRequest
{
    public string Message { get; set; } = string.Empty;
}

public class DoctorSessionNoteRequest
{
    public string Note { get; set; } = string.Empty;
}

public class SessionMetadataResponse
{
    public string AppointmentId { get; set; } = string.Empty;
    public string AgoraChannelName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }
    public long DurationSeconds { get; set; }
    public string AppointmentStatus { get; set; } = string.Empty;
    public string AppointmentDate { get; set; } = string.Empty;
    public string TimeSlot { get; set; } = string.Empty;
    public IReadOnlyCollection<SessionParticipantResponse> Participants { get; set; } = Array.Empty<SessionParticipantResponse>();
    public int MessageCount { get; set; }
    public int DoctorNoteCount { get; set; }
}

public class SessionParticipantResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime? FirstJoinedAtUtc { get; set; }
    public DateTime? LastJoinedAtUtc { get; set; }
    public DateTime? LeftAtUtc { get; set; }
    public IReadOnlyCollection<DateTime> JoinEventsUtc { get; set; } = Array.Empty<DateTime>();
}
