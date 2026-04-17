using System.Net.Http.Json;
using AppointmentService.DTOs;

namespace AppointmentService.Clients;

public class NotificationClient
{
    private readonly HttpClient _http;

    public NotificationClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> SendAppointmentBookedAsync(AppointmentNotificationRequest payload, CancellationToken cancellationToken = default)
    {
        var response = await _http.PostAsJsonAsync("api/v1/Notification/appointment-booked", payload, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
