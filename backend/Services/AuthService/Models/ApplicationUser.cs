using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Models;

public class ApplicationUser : IdentityUser<Guid>
{
    // Add custom properties
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; } = "Patient"; // Patient, Doctor, Admin
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? Titles { get; set; } //mr, mrs, ms
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpireTime { get; set; }

    public string? LastLoginIp { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties 
    public virtual ICollection<IdentityUserClaim<Guid>> Claims { get; set; }
    public virtual ICollection<IdentityUserLogin<Guid>> Logins { get; set; }
    public virtual ICollection<IdentityUserToken<Guid>> Tokens { get; set; }
    public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; }
}