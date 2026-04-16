using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace TelemedicineService.Clients;

public class UserProfileLookupClient : IUserProfileLookupClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserProfileLookupClient> _logger;

    public UserProfileLookupClient(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<UserProfileLookupClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<int?> GetPatientIdByUserIdAsync(string userId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return null;
        }

        var baseUrl = _configuration["Dependencies:PatientService:BaseUrl"] ?? "https://localhost:5002";
        var requestUri = $"{baseUrl.TrimEnd('/')}/api/v1/patients/user/{parsedUserId}";

        try
        {
            using var response = await _httpClient.GetAsync(requestUri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            return doc.RootElement.TryGetProperty("id", out var idValue) ? idValue.GetInt32() : null;
        }
        catch (Exception ex) when (ex is HttpRequestException || ex is JsonException || ex is TaskCanceledException)
        {
            _logger.LogWarning(ex, "Failed to resolve patient profile for userId {UserId}", userId);
            return null;
        }
    }

    public async Task<int?> GetDoctorIdByUserIdAsync(string userId, CancellationToken cancellationToken)
    {
        var baseUrl = _configuration["Dependencies:DoctorService:BaseUrl"] ?? "https://localhost:5003";
        var requestUri = $"{baseUrl.TrimEnd('/')}/api/v1/doctors";

        try
        {
            using var response = await _httpClient.GetAsync(requestUri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            foreach (var doctor in doc.RootElement.EnumerateArray())
            {
                var doctorUserId = doctor.TryGetProperty("userId", out var userIdValue)
                    ? userIdValue.GetString()
                    : null;

                if (!string.IsNullOrWhiteSpace(doctorUserId)
                    && string.Equals(doctorUserId, userId, StringComparison.OrdinalIgnoreCase)
                    && doctor.TryGetProperty("id", out var doctorIdValue))
                {
                    return doctorIdValue.GetInt32();
                }
            }

            return null;
        }
        catch (Exception ex) when (ex is HttpRequestException || ex is JsonException || ex is TaskCanceledException)
        {
            _logger.LogWarning(ex, "Failed to resolve doctor profile for userId {UserId}", userId);
            return null;
        }
    }
}
