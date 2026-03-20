using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Auth;

public class UserRegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = default!;

    [Required]
    public string FirstName { get; set; } = default!;

    [Required]
    public string LastName { get; set; } = default!;

    [Required]
    public string Role { get; set; } = "Patient";

    public string PFNO { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}