using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    public string FirstName { get; set; } = default!;

    [Required]
    public string LastName { get; set; } = default!;

    public string? PhoneNumber { get; set; }
    public string? Designation { get; set; }
    public string? Img { get; set; }
    public string? Signature { get; set; }
}