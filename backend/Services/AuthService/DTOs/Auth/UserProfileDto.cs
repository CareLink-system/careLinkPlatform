namespace AuthService.DTOs.Auth;

public class UserProfileDto
{
    public string Id { get; set; } = default!;

    public string Email { get; set; } = default!;

    public string FirstName { get; set; } = default!;

    public string LastName { get; set; } = default!;

    public string? Titles { get; set; }

    public string Role { get; set; } = default!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public string? LastLoginIp { get; set; }
}
