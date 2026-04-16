using TelemedicineService.Models;

namespace TelemedicineService.Clients;

public interface IAppointmentLookupClient
{
    Task<AppointmentSnapshot?> GetAppointmentAsync(int appointmentId, CancellationToken cancellationToken);
}
