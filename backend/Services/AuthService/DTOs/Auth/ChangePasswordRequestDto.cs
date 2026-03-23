using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = default!;

    [Required(ErrorMessage = "New password is required")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters")]
    public string NewPassword { get; set; } = default!;
}
