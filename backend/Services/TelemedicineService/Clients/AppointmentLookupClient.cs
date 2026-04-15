using System.Text.Json;
using Microsoft.Extensions.Options;
using TelemedicineService.Models;

namespace TelemedicineService.Clients;

public class AppointmentLookupClient : IAppointmentLookupClient
{
    private readonly HttpClient _httpClient;

    public AppointmentLookupClient(HttpClient httpClient, IOptions<AppointmentServiceOptions> options)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(options.Value.BaseUrl.TrimEnd('/'));
    }

    public async Task<AppointmentSnapshot?> GetAppointmentAsync(int appointmentId, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync($"/api/v1/Appointments/{appointmentId}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        var root = document.RootElement;

        return new AppointmentSnapshot
        {
            Id = root.GetProperty("id").GetInt32(),
            DoctorId = root.GetProperty("doctorId").GetInt32(),
            PatientId = root.GetProperty("patientId").GetInt32(),
            AppointmentStatus = ReadStatus(root),
            AppointmentDate = root.TryGetProperty("appointmentDate", out var dateValue) ? dateValue.GetString() ?? string.Empty : string.Empty,
            TimeSlot = root.TryGetProperty("timeSlot", out var slotValue) ? slotValue.GetString() ?? string.Empty : string.Empty
        };
    }

    private static string ReadStatus(JsonElement root)
    {
        if (!root.TryGetProperty("appointmentStatus", out var statusValue))
        {
            return string.Empty;
        }

        if (statusValue.ValueKind == JsonValueKind.String)
        {
            return statusValue.GetString() ?? string.Empty;
        }

        if (statusValue.ValueKind == JsonValueKind.Number)
        {
            return statusValue.GetInt32().ToString();
        }

        return string.Empty;
    }
}
