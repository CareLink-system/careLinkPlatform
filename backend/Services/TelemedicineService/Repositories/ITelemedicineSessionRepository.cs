using TelemedicineService.Models;

namespace TelemedicineService.Repositories;

public interface ITelemedicineSessionRepository
{
    Task<TelemedicineSession?> GetByAppointmentIdAsync(string appointmentId, CancellationToken cancellationToken);
    Task UpsertAsync(TelemedicineSession session, CancellationToken cancellationToken);
}
