using AuthService.DTOs.Auth;
using AuthService.DTOs.Common;
using AuthService.DTOs.Users;
using AuthService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private static readonly string[] SupportedRoles = { "Patient", "Doctor", "Admin" };
    private static readonly string[] PublicRegistrationRoles = { "Patient", "Doctor" };
    private const string DevJwtKeyFallback = "carelink-dev-jwt-key-minimum-32-characters-long";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetUserIpAddress()
    {
        var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        if (ip == "::1") ip = "127.0.0.1";
        return ip ?? "unknown";
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register(
        [FromBody] UserRegisterDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Invalid registration request. Errors: {Errors}", string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var userIp = GetUserIpAddress();

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed. Duplicate email: {Email}", request.Email);
                return Conflict(ApiResponse<object>.FailResponse("User with this email already exists."));
            }

            _logger.LogInformation("Registering user. Email: {Email}, IP: {IP}", request.Email, userIp);

            // Create new user with ApplicationUser model
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = NormalizeRegistrationRole(request.Role),
                Titles = request.Titles,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Registration failed. Errors: {Errors}", string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Registration failed.", errors));
            }

            // Assign role
            if (!TryNormalizeRegistrationRole(request.Role, out var role))
            {
                return BadRequest(ApiResponse<object>.FailResponse("Invalid role selected. Only Patient and Doctor can be created from public registration."));
            }

            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = role });
            }
            await _userManager.AddToRoleAsync(user, role);

            // Generate JWT token
            var token = await GenerateJwtToken(user);

            var response = new AuthResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = role,
                Token = token,
                RefreshToken = user.RefreshToken
            };

            _logger.LogInformation("User registered successfully. Email: {Email}, UserId: {UserId}", request.Email, user.Id);

            return CreatedAtAction(
                nameof(Register),
                new { id = user.Id },
                ApiResponse<AuthResponseDto>.SuccessResponse(response, "User registered successfully."));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Registration request cancelled.");
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration. Email: {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.FailResponse("An unexpected error occurred during registration."));
        }
    }

    /// <summary>
    /// Logs in a user and returns authentication token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] UserLoginDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Invalid login request. Errors: {Errors}", string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var userIp = GetUserIpAddress();

            _logger.LogInformation("Login attempt. Email: {Email}, IP: {IP}", request.Email, userIp);

            // Find user by email
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed. User not found: {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid email or password."));
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed. User inactive: {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.FailResponse("Your account is inactive. Please contact support."));
            }

            // Verify password
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed. Invalid password for: {Email}", request.Email);
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid email or password."));
            }

            // Generate JWT token
            var token = await GenerateJwtToken(user);

            // Generate refresh token
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            user.LastLoginIp = userIp;
            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);
            var role = GetEffectiveRole(user, roles);

            var response = new AuthResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = role,
                Token = token,
                RefreshToken = refreshToken
            };

            _logger.LogInformation("User logged in successfully. Email: {Email}, UserId: {UserId}", request.Email, user.Id);

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful."));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Login request cancelled.");
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login. Email: {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.FailResponse("An unexpected error occurred during login."));
        }
    }

    /// <summary>
    /// Refreshes the JWT token using refresh token.
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken(
        [FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken);

            if (user == null || user.RefreshTokenExpireTime <= DateTime.UtcNow)
            {
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid or expired refresh token."));
            }

            var newToken = await GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var role = GetEffectiveRole(user, roles);

            var response = new AuthResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = role,
                Token = newToken,
                RefreshToken = newRefreshToken
            };

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(response, "Token refreshed successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while refreshing token."));
        }
    }

    /// <summary>
    /// Logout user.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpireTime = null;
                    await _userManager.UpdateAsync(user);
                }
            }

            await _signInManager.SignOutAsync();

            _logger.LogInformation("User logged out. UserId: {UserId}", userId);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Logged out successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred during logout."));
        }
    }

    /// <summary>
    /// Get current user profile.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid token."));
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var profile = new UserProfileDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Titles = user.Titles,
                Role = GetEffectiveRole(user, roles),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                LastLoginIp = user.LastLoginIp
            };

            return Ok(ApiResponse<UserProfileDto>.SuccessResponse(profile, "Profile retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving profile."));
        }
    }

    /// <summary>
    /// Change password.
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword(
        [FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailResponse("Invalid request data."));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.FailResponse("Password change failed.", errors));
            }

            _logger.LogInformation("Password changed for user: {Email}", user.Email);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Password changed successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while changing password."));
        }
    }

    /// <summary>
    /// Update user profile.
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateProfile(
        [FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Titles = request.Titles ?? user.Titles;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.FailResponse("Profile update failed.", errors));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var profile = new UserProfileDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Titles = user.Titles,
                Role = GetEffectiveRole(user, roles),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            _logger.LogInformation("Profile updated for user: {Email}", user.Email);
            return Ok(ApiResponse<UserProfileDto>.SuccessResponse(profile, "Profile updated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while updating profile."));
        }
    }

    /// <summary>
    /// Validate token.
    /// </summary>
    [HttpGet("validate-token")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public IActionResult ValidateToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();
        var expiresAt = User.FindFirst("exp")?.Value;

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            IsValid = true,
            UserId = userId,
            Email = userEmail,
            Roles = roles,
            
            //ExpiresAt = expiresAt.HasValue
            //    ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(expiresAt)).DateTime
            //    : (DateTime?)null

            ExpiresAt = !string.IsNullOrEmpty(expiresAt)
                ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(expiresAt)).DateTime
                : (DateTime?)null
        }, "Token is valid."));
    }

    // ==================== PRIVATE METHODS ====================

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? DevJwtKeyFallback);

        var roles = await _userManager.GetRolesAsync(user);
        var effectiveRoles = roles.Where(IsSupportedRole).ToList();

        if (effectiveRoles.Count == 0)
        {
            effectiveRoles.Add(GetEffectiveRole(user));
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim("firstName", user.FirstName ?? ""),
            new Claim("lastName", user.LastName ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        // Add roles as claims
        foreach (var role in effectiveRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["Jwt:ExpireHours"] ?? "24")),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }

    private static bool IsSupportedRole(string? role)
    {
        return SupportedRoles.Any(supported => string.Equals(supported, role?.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private static bool TryNormalizeRole(string? role, out string normalizedRole)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            normalizedRole = "Patient";
            return true;
        }

        var match = SupportedRoles.FirstOrDefault(supported => string.Equals(supported, role.Trim(), StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(match))
        {
            normalizedRole = match;
            return true;
        }

        normalizedRole = "Patient";
        return false;
    }

    private static string NormalizeRole(string? role)
    {
        return TryNormalizeRole(role, out var normalizedRole) ? normalizedRole : "Patient";
    }

    private static string NormalizeRegistrationRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return "Patient";
        }

        var match = PublicRegistrationRoles.FirstOrDefault(supported => string.Equals(supported, role.Trim(), StringComparison.OrdinalIgnoreCase));
        return match ?? "Patient";
    }

    private static bool TryNormalizeRegistrationRole(string? role, out string normalizedRole)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            normalizedRole = "Patient";
            return true;
        }

        var match = PublicRegistrationRoles.FirstOrDefault(supported => string.Equals(supported, role.Trim(), StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(match))
        {
            normalizedRole = match;
            return true;
        }

        normalizedRole = "Patient";
        return false;
    }

    private static string GetEffectiveRole(ApplicationUser user, IEnumerable<string>? roles = null)
    {
        var normalizedRole = roles?.FirstOrDefault(IsSupportedRole);
        if (!string.IsNullOrWhiteSpace(normalizedRole))
        {
            return NormalizeRole(normalizedRole);
        }

        return NormalizeRole(user.Role);
    }
}
