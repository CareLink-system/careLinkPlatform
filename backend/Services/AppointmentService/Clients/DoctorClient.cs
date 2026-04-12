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
}