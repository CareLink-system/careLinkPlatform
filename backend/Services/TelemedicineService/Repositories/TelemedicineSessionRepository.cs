using MongoDB.Driver;
using TelemedicineService.Models;

namespace TelemedicineService.Repositories;

public class TelemedicineSessionRepository : ITelemedicineSessionRepository
{
    private readonly IMongoCollection<TelemedicineSession> _collection;

    public TelemedicineSessionRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<TelemedicineSession>("telemedicine_sessions");

        var indexKeys = Builders<TelemedicineSession>.IndexKeys.Ascending(x => x.AppointmentId);
        var indexOptions = new CreateIndexOptions { Unique = true };
        _collection.Indexes.CreateOne(new CreateIndexModel<TelemedicineSession>(indexKeys, indexOptions));
    }

    public async Task<TelemedicineSession?> GetByAppointmentIdAsync(string appointmentId, CancellationToken cancellationToken)
    {
        var session = await _collection
            .Find(x => x.AppointmentId == appointmentId)
            .FirstOrDefaultAsync(cancellationToken);

        return session;
    }

    public Task UpsertAsync(TelemedicineSession session, CancellationToken cancellationToken)
    {
        session.UpdatedAtUtc = DateTime.UtcNow;

        return _collection.ReplaceOneAsync(
            x => x.AppointmentId == session.AppointmentId,
            session,
            new ReplaceOptions { IsUpsert = true },
            cancellationToken);
    }
}
