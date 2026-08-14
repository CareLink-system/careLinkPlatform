namespace AuthService.DTOs.Users;

using System.ComponentModel.DataAnnotations;

public class UserResponseDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Titles { get; set; }
    public string? Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? LastLoginIp { get; set; }
}


public class UserCreateDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = default!;

    [Required(ErrorMessage = "FirstName is required")]
    public string FirstName { get; set; } = default!;

    [Required(ErrorMessage = "LastName is required")]
    public string LastName { get; set; } = default!;

    [Required(ErrorMessage = "Role is required")]
    public string Role { get; set; } = "Patient";

    public string? PhoneNumber { get; set; }
}

public class UserUpdateDto
{
    [Required(ErrorMessage = "FirstName is required")]
    public string FirstName { get; set; } = default!;

    [Required(ErrorMessage = "LastName is required")]
    public string LastName { get; set; } = default!;
    public string? Role { get; set; }
    public string Titles { get; set; }
    public string? PhoneNumber { get; set; }
    public string? FullName { get; set; }
    public string? Designation { get; set; }
    public bool? IsActive { get; set; }

}

public class UserUpdateDtoNew
{
    
    public string? FirstName { get; set; } = default!;

    
    public string? LastName { get; set; } = default!;
    public string? Role { get; set; }
    public string? Titles { get; set; }
    public string? PhoneNumber { get; set; }
    public string? FullName { get; set; }
    public string? Designation { get; set; }
    public bool? IsActive { get; set; }
    public int? status { get; set; }

}
public class PaginatedUserResponse
{
    public List<UserResponseDto> Users { get; set; } = new();

    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

// ==================== DTOs ====================

public class UserRegisterDto
{
    [Required, EmailAddress]
    public string Email { get; set; }

    [Required, MinLength(6)]
    public string Password { get; set; }

    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? Titles { get; set; }
    public string? Role { get; set; } = "Patient";
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; }
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; }

    [Required, MinLength(6)]
    public string NewPassword { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Titles { get; set; }
}

public class UpdateCurrentUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Titles { get; set; }
}