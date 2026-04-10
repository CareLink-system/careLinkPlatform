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
}