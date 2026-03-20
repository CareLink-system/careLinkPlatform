using AuthService.DTOs.Auth;
using AuthService.DTOs.Common;
using AuthService.Exceptions;
using AuthService.Services.AuthService;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IIdentityService _identityService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IIdentityService identityService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _identityService = identityService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="request">User registration data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="201">User registered successfully.</response>
    /// <response code="400">Invalid request data or duplicate email.</response>
    /// <response code="409">Email already exists.</response>
    /// <response code="500">Internal server error.</response>
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

            var currentUserId = _identityService.GetUserIdentity();
            var userIp = _identityService.GetUserIpAddress();

            _logger.LogInformation(
                "Registering user. Email: {Email}, IP: {IP}",
                request.Email, userIp);

            var result = await _authService.RegisterAsync(
                request, currentUserId, userIp, cancellationToken);

            _logger.LogInformation(
                "User registered successfully. Email: {Email}, UserId: {UserId}",
                request.Email, result.Id);

            return CreatedAtAction(
                nameof(Register),
                new { id = result.Id },
                ApiResponse<AuthResponseDto>.SuccessResponse(result, "User registered successfully."));
        }
        catch (DuplicateEmailException ex)
        {
            _logger.LogWarning(ex, "Registration failed. Duplicate email: {Email}", request.Email);
            return Conflict(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (InvalidUserDataException ex)
        {
            _logger.LogWarning(ex, "Registration failed with invalid data. Email: {Email}", request.Email);
            return BadRequest(ApiResponse<object>.FailResponse(ex.Message));
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
    /// <param name="request">User login credentials</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="200">Login successful.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Invalid credentials.</response>
    /// <response code="500">Internal server error.</response>
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

            var userIp = _identityService.GetUserIpAddress();

            _logger.LogInformation("Login attempt. Email: {Email}, IP: {IP}", request.Email, userIp);

            var result = await _authService.LoginAsync(request, userIp, cancellationToken);

            _logger.LogInformation(
                "User logged in successfully. Email: {Email}, UserId: {UserId}",
                request.Email, result.Id);

            return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Login successful."));
        }
        catch (InvalidCredentialsException ex)
        {
            _logger.LogWarning(ex, "Login failed. Invalid credentials for email: {Email}", request.Email);
            return Unauthorized(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (PasswordMismatchException ex)
        {
            _logger.LogWarning(ex, "Login failed. Password mismatch for email: {Email}", request.Email);
            return Unauthorized(ApiResponse<object>.FailResponse(ex.Message));
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
}