using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = default!;
}
