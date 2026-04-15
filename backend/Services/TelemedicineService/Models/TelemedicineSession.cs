using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace TelemedicineService.Models;

public class TelemedicineSession
{
    public int Id { get; set; }

    [Required]
    [MaxLength(32)]
    public string AppointmentId { get; set; } = string.Empty;

    public int AppointmentNumericId { get; set; }

    public int DoctorId { get; set; }

    public int PatientId { get; set; }

    [Required]
    [MaxLength(128)]
    public string AgoraChannelName { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = "Pending";

    public DateTime? StartedAtUtc { get; set; }

    public DateTime? EndedAtUtc { get; set; }

    public long DurationSeconds { get; set; }

    [Required]
    public string ParticipantsJson { get; set; } = "[]";

    [Required]
    public string MessagesJson { get; set; } = "[]";

    [Required]
    public string DoctorNotesJson { get; set; } = "[]";

    [NotMapped]
    public List<SessionParticipant> Participants { get; set; } = new();

    [NotMapped]
    public List<SessionMessage> Messages { get; set; } = new();

    [NotMapped]
    public List<DoctorSessionNote> DoctorNotes { get; set; } = new();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public void HydrateCollections()
    {
        Participants = Deserialize<List<SessionParticipant>>(ParticipantsJson);
        Messages = Deserialize<List<SessionMessage>>(MessagesJson);
        DoctorNotes = Deserialize<List<DoctorSessionNote>>(DoctorNotesJson);
    }

    public void PersistCollections()
    {
        ParticipantsJson = JsonSerializer.Serialize(Participants ?? new List<SessionParticipant>());
        MessagesJson = JsonSerializer.Serialize(Messages ?? new List<SessionMessage>());
        DoctorNotesJson = JsonSerializer.Serialize(DoctorNotes ?? new List<DoctorSessionNote>());
    }

    private static T Deserialize<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return Activator.CreateInstance<T>()!;
        }

        return JsonSerializer.Deserialize<T>(json) ?? Activator.CreateInstance<T>()!;
    }
}

public class SessionParticipant
{
    public string UserId { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public DateTime? FirstJoinedAtUtc { get; set; }

    public DateTime? LastJoinedAtUtc { get; set; }

    public DateTime? LeftAtUtc { get; set; }

    public List<DateTime> JoinEventsUtc { get; set; } = new();
}

public class SessionMessage
{
    public string SenderUserId { get; set; } = string.Empty;

    public string SenderRole { get; set; } = string.Empty;

    public string SenderDisplayName { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public DateTime SentAtUtc { get; set; } = DateTime.UtcNow;
}

public class DoctorSessionNote
{
    public string DoctorUserId { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
