using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class ChangePasswordDto
{
    [Required]
    public string Email { get; set; } = default!;

    [Required]
    public string CurrentPassword { get; set; } = default!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = default!;
}