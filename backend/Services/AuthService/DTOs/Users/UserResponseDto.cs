namespace AuthService.DTOs.Users;

using System.ComponentModel.DataAnnotations;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string? FullName { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
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
    public string? PFNO { get; set; }
}

public class UserUpdateDto
{
    [Required(ErrorMessage = "FirstName is required")]
    public string FirstName { get; set; } = default!;

    [Required(ErrorMessage = "LastName is required")]
    public string LastName { get; set; } = default!;

    public string? PhoneNumber { get; set; }
    public string? FullName { get; set; }
    public string? Designation { get; set; }
}

public class PaginatedUserResponse
{
    public List<UserResponseDto> Data { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
