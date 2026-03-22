namespace AuthService.DTOs.Auth;

public class AuthResponseDto
{
    public string Id { get; set; } = default!;

    public string Email { get; set; } = default!;

    public string FirstName { get; set; } = default!;

    public string LastName { get; set; } = default!;

    public string Role { get; set; } = default!;

    public string Token { get; set; } = default!;

    public string? RefreshToken { get; set; }
}
