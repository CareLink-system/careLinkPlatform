using Microsoft.AspNetCore.Mvc;
using AuthService.Models;
using BCrypt.Net;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Simple in-memory storage for now (replace with DB later)
    private static List<User> users = new List<User>();
    
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        // Check if user exists
        if (users.Any(u => u.Email == request.Email))
            return BadRequest("User already exists");
            
        // Create new user
        var user = new User
        {
            Id = users.Count + 1,
            Email = request.Email,
            PasswordHash = BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };
        
        users.Add(user);
        return Ok(new { message = "User registered successfully" });
    }
    
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null || !BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");
            
        // Generate JWT token (simplified for now)
        var token = "dummy-jwt-token"; // You'll implement JWT properly later
        
        return Ok(new 
        { 
            token = token,
            user = new { user.Id, user.Email, user.FirstName, user.LastName, user.Role }
        });
    }
}

public class RegisterRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}