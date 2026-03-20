using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class UserLoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;
}