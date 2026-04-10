namespace AppointmentService.Clients;

public class AvailabilityClient
{
    private readonly HttpClient _http;

    public AvailabilityClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<bool> IsAvailable(int availabilityId)
    {
        var res = await _http.GetAsync($"/api/v1/doctors/availability/{availabilityId}");
        return res.IsSuccessStatusCode;
    }
}