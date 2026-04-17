using System.Net.Http.Json;

namespace AppointmentService.Clients;

public class PatientClient
{
    private readonly HttpClient _http;

    public PatientClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> Exists(int patientId)
    {
        var res = await _http.GetAsync($"api/v1/patients/{patientId}");
        return res.IsSuccessStatusCode;
    }

    public async Task<PatientProfile?> GetById(int patientId)
    {
        var res = await _http.GetAsync($"api/v1/patients/{patientId}");
        if (!res.IsSuccessStatusCode)
        {
            return null;
        }

        return await res.Content.ReadFromJsonAsync<PatientProfile>();
    }
}

public class PatientProfile
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}