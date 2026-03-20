using AuthService.Enum;
using AuthService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models;

public class User : AuditableEntity
{
    public int Id { get; set; }

    [Required, EmailAddress]
    public string Email { get; set; } = default!;

    public string PasswordHash { get; set; } = default!;

    [Required]
    public string FirstName { get; set; } = default!;

    [Required]
    public string LastName { get; set; } = default!;

    [Required]
    public string Role { get; set; } = "Patient";

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpireTime { get; set; }

    public Guid AccessToken { get; set; } = Guid.NewGuid();
    public DateTime? AccessTokenExpireTime { get; set; } = DateTime.UtcNow.AddHours(1);

    public string PFNO { get; set; } = default!;
    public string? Titles { get; set; }
    public string? Initial { get; set; }
    public string? Surname { get; set; }
    public string? FullName { get; set; }
    public string? Designation { get; set; }
    public string? Sex { get; set; }
    public int? APPOINTMENT_ID { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Img { get; set; }
    public int NoOfLogin { get; set; } = 0;
    public int NoofAttempt { get; set; } = 0;
    public string? LoginIP { get; set; }
    public string? Signature { get; set; }
}