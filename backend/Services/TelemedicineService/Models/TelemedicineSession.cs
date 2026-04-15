using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TelemedicineService.Models;

public class TelemedicineSession
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("appointmentId")]
    public string AppointmentId { get; set; } = string.Empty;

    [BsonElement("appointmentNumericId")]
    public int AppointmentNumericId { get; set; }

    [BsonElement("doctorId")]
    public int DoctorId { get; set; }

    [BsonElement("patientId")]
    public int PatientId { get; set; }

    [BsonElement("agoraChannelName")]
    public string AgoraChannelName { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "Pending";

    [BsonElement("startedAtUtc")]
    public DateTime? StartedAtUtc { get; set; }

    [BsonElement("endedAtUtc")]
    public DateTime? EndedAtUtc { get; set; }

    [BsonElement("durationSeconds")]
    public long DurationSeconds { get; set; }

    [BsonElement("participants")]
    public List<SessionParticipant> Participants { get; set; } = new();

    [BsonElement("messages")]
    public List<SessionMessage> Messages { get; set; } = new();

    [BsonElement("doctorNotes")]
    public List<DoctorSessionNote> DoctorNotes { get; set; } = new();

    [BsonElement("createdAtUtc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAtUtc")]
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class SessionParticipant
{
    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = string.Empty;

    [BsonElement("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [BsonElement("firstJoinedAtUtc")]
    public DateTime? FirstJoinedAtUtc { get; set; }

    [BsonElement("lastJoinedAtUtc")]
    public DateTime? LastJoinedAtUtc { get; set; }

    [BsonElement("leftAtUtc")]
    public DateTime? LeftAtUtc { get; set; }

    [BsonElement("joinEventsUtc")]
    public List<DateTime> JoinEventsUtc { get; set; } = new();
}

public class SessionMessage
{
    [BsonElement("senderUserId")]
    public string SenderUserId { get; set; } = string.Empty;

    [BsonElement("senderRole")]
    public string SenderRole { get; set; } = string.Empty;

    [BsonElement("senderDisplayName")]
    public string SenderDisplayName { get; set; } = string.Empty;

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    [BsonElement("sentAtUtc")]
    public DateTime SentAtUtc { get; set; } = DateTime.UtcNow;
}

public class DoctorSessionNote
{
    [BsonElement("doctorUserId")]
    public string DoctorUserId { get; set; } = string.Empty;

    [BsonElement("note")]
    public string Note { get; set; } = string.Empty;

    [BsonElement("createdAtUtc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
