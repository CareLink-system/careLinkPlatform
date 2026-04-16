using Microsoft.EntityFrameworkCore;
using TelemedicineService.Data;
using TelemedicineService.Models;

namespace TelemedicineService.Repositories;

public class TelemedicineSessionRepository : ITelemedicineSessionRepository
{
    private readonly TelemedicineDbContext _context;

    public TelemedicineSessionRepository(TelemedicineDbContext context)
    {
        _context = context;
    }

    public async Task<TelemedicineSession?> GetByAppointmentIdAsync(string appointmentId, CancellationToken cancellationToken)
    {
        var entity = await _context.TelemedicineSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.AppointmentId == appointmentId, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.HydrateCollections();
        return entity;
    }

    public async Task UpsertAsync(TelemedicineSession session, CancellationToken cancellationToken)
    {
        session.UpdatedAtUtc = DateTime.UtcNow;
        session.PersistCollections();

        var existing = await _context.TelemedicineSessions
            .FirstOrDefaultAsync(x => x.AppointmentId == session.AppointmentId, cancellationToken);

        if (existing is null)
        {
            session.CreatedAtUtc = session.CreatedAtUtc == default ? DateTime.UtcNow : session.CreatedAtUtc;
            _context.TelemedicineSessions.Add(session);
        }
        else
        {
            existing.AppointmentNumericId = session.AppointmentNumericId;
            existing.DoctorId = session.DoctorId;
            existing.PatientId = session.PatientId;
            existing.AgoraChannelName = session.AgoraChannelName;
            existing.Status = session.Status;
            existing.StartedAtUtc = session.StartedAtUtc;
            existing.EndedAtUtc = session.EndedAtUtc;
            existing.DurationSeconds = session.DurationSeconds;
            existing.ParticipantsJson = session.ParticipantsJson;
            existing.MessagesJson = session.MessagesJson;
            existing.DoctorNotesJson = session.DoctorNotesJson;
            existing.UpdatedAtUtc = session.UpdatedAtUtc;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
