using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = default!;
}
