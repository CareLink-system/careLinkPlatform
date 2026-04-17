using System.Net.Http.Json;

namespace AppointmentService.Clients;

public class DoctorClient
{
    private readonly HttpClient _http;

    public DoctorClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> Exists(int doctorId)
    {
        var res = await _http.GetAsync($"/api/v1/doctors/{doctorId}");
        return res.IsSuccessStatusCode;
    }

    public async Task<DoctorProfile?> GetById(int doctorId)
    {
        var res = await _http.GetAsync($"/api/v1/doctors/{doctorId}");
        if (!res.IsSuccessStatusCode)
        {
            return null;
        }

        return await res.Content.ReadFromJsonAsync<DoctorProfile>();
    }
}

public class DoctorProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
}