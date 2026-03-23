using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "First name is required")]
    public string FirstName { get; set; } = default!;

    [Required(ErrorMessage = "Last name is required")]
    public string LastName { get; set; } = default!;

    public string? Titles { get; set; }
}
