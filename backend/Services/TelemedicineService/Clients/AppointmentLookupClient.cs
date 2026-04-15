using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using TelemedicineService.Models;

namespace TelemedicineService.Clients;

public class AppointmentLookupClient : IAppointmentLookupClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AppointmentLookupClient> _logger;

    public AppointmentLookupClient(
        HttpClient httpClient,
        IOptions<AppointmentServiceOptions> options,
        ILogger<AppointmentLookupClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.BaseAddress = new Uri(options.Value.BaseUrl.TrimEnd('/'));
    }

    public async Task<AppointmentSnapshot?> GetAppointmentAsync(int appointmentId, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await _httpClient.GetAsync($"/api/v1/Appointments/{appointmentId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Appointment lookup failed with status {StatusCode} for appointment {AppointmentId}", response.StatusCode, appointmentId);
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
        catch (Exception ex) when (ex is HttpRequestException || ex is TaskCanceledException || ex is JsonException)
        {
            _logger.LogError(ex, "Failed to fetch appointment {AppointmentId} from AppointmentService", appointmentId);
            return null;
        }
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
