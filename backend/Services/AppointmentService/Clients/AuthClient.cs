using System.Net.Http.Json;

namespace AppointmentService.Clients;

public class AuthClient
{
    private readonly HttpClient _http;

    public AuthClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<UserContact?> GetUserContactById(string userId)
    {
        var res = await _http.GetAsync($"api/v1/Auth/Users/internal/{userId}/contact");
        if (!res.IsSuccessStatusCode)
        {
            return null;
        }

        return await res.Content.ReadFromJsonAsync<UserContact>();
    }
}

public class UserContact
{
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
