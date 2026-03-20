using AuthService.DTOs.Auth;
using AuthService.DTOs.Common;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private static readonly List<User> users = new();
    private readonly IIdentityService _identityService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IIdentityService identityService, ILogger<AuthController> logger)
    {
        _identityService = identityService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <response code="200">User registered successfully.</response>
    /// <response code="400">If the request is invalid.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            if (users.Any(u => u.Email.Equals(model.Email, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest(ApiResponse<object>.FailResponse("User already exists."));
            }

            string loginUser = _identityService.GetUserIdentity();

            var user = new User
            {
                Id = users.Count + 1,
                Email = model.Email.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                FirstName = model.FirstName.Trim(),
                LastName = model.LastName.Trim(),
                Role = model.Role.Trim(),
                PFNO = model.PFNO,
                PhoneNumber = model.PhoneNumber,
                FullName = $"{model.FirstName} {model.LastName}",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = loginUser,
                LoginIP = _identityService.GetUserIpAddress()
            };

            users.Add(user);

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role
            }, "User registered successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while registering user.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Logs in a user and returns authentication token.
    /// </summary>
    /// <response code="200">Login successful.</response>
    /// <response code="401">Invalid credentials.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] UserLoginDto model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var user = users.FirstOrDefault(u =>
                u.Email.Equals(model.Email, StringComparison.OrdinalIgnoreCase));

            if (user == null)
            {
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid credentials."));
            }

            bool passwordValid = BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash);
            if (!passwordValid)
            {
                user.NoofAttempt += 1;
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid credentials."));
            }

            user.NoOfLogin += 1;
            user.NoofAttempt = 0;
            user.LoginIP = _identityService.GetUserIpAddress();
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = user.Email;

            var token = $"dummy-jwt-token-{Guid.NewGuid()}";

            var response = new AuthResponseDto
            {
                Token = token,
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            };

            await Task.CompletedTask;

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while logging in.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Changes the password of an existing user.
    /// </summary>
    /// <response code="200">Password changed successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var user = users.FirstOrDefault(x =>
                x.Email.Equals(model.Email, StringComparison.OrdinalIgnoreCase));

            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            if (!BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(ApiResponse<object>.FailResponse("Current password is incorrect."));
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(null, "Password changed successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while changing password.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Refreshes the authentication token.
    /// </summary>
    /// <response code="200">Token refreshed successfully.</response>
    /// <response code="404">User not found.</response>
    [HttpPost("refresh-token/{email}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RefreshToken(string email)
    {
        try
        {
            var user = users.FirstOrDefault(x => x.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.RefreshToken = Guid.NewGuid().ToString();
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                user.RefreshToken,
                user.RefreshTokenExpireTime
            }, "Token refreshed successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while refreshing token.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }
}