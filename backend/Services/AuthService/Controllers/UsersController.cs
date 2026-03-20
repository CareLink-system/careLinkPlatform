using AuthService.DTOs.Common;
using AuthService.DTOs.Users;
using AuthService.Exceptions;
using AuthService.Services;
using AuthService.Services.UserService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IIdentityService _identityService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        IIdentityService identityService,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _identityService = identityService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all users with optional filtering and pagination.
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 1000)</param>
    /// <param name="searchTerm">Optional search term for email or name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="200">Returns paginated list of users.</response>
    /// <response code="400">Invalid pagination parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedUserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedUserResponse>>> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 1000)
            {
                _logger.LogWarning(
                    "Invalid pagination parameters. PageNumber: {PageNumber}, PageSize: {PageSize}",
                    pageNumber, pageSize);

                return BadRequest(ApiResponse<object>.FailResponse(
                    "Invalid pagination parameters. PageNumber must be >= 1 and PageSize must be between 1 and 1000."));
            }

            _logger.LogInformation(
                "Retrieving users. Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}",
                pageNumber, pageSize, searchTerm ?? "none");

            var result = await _userService.GetAllUsersAsync(
                pageNumber, pageSize, searchTerm, cancellationToken);

            _logger.LogInformation(
                "Users retrieved successfully. Total: {TotalCount}, Pages: {TotalPages}",
                result.TotalCount, result.TotalPages);

            return Ok(ApiResponse<PaginatedUserResponse>.SuccessResponse(
                result, "Users retrieved successfully."));
        }
        catch (InvalidUserDataException ex)
        {
            _logger.LogWarning(ex, "Invalid user data");
            return BadRequest(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Request to get all users was cancelled.");
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving users."));
        }
    }

    /// <summary>
    /// Gets a user by ID.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="200">Returns user details.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserById(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                _logger.LogWarning("Invalid user ID: {UserId}", id);
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            _logger.LogInformation("Fetching user. UserId: {UserId}", id);

            var user = await _userService.GetUserByIdAsync(id, cancellationToken);

            _logger.LogInformation("User retrieved successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(user, "User retrieved successfully."));
        }
        catch (UserNotFoundException ex)
        {
            _logger.LogWarning(ex, "User not found. UserId: {UserId}", id);
            return NotFound(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (InvalidUserDataException ex)
        {
            _logger.LogWarning(ex, "Invalid user data request. UserId: {UserId}", id);
            return BadRequest(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Request to get user {UserId} was cancelled.", id);
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving the user."));
        }
    }

    /// <summary>
    /// Updates user information.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Updated user data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="200">User updated successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> UpdateUser(
        int id,
        [FromBody] UserUpdateDto request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                _logger.LogWarning("Invalid user ID: {UserId}", id);
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning(
                    "Invalid update request for user {UserId}. Errors: {Errors}",
                    id, string.Join(", ", errors));

                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var currentUserId = _identityService.GetUserIdentity();

            _logger.LogInformation(
                "Updating user. UserId: {UserId}, UpdatedBy: {UpdatedBy}",
                id, currentUserId);

            var result = await _userService.UpdateUserAsync(
                id, request, currentUserId, cancellationToken);

            _logger.LogInformation("User updated successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result, "User updated successfully."));
        }
        catch (UserNotFoundException ex)
        {
            _logger.LogWarning(ex, "User not found for update. UserId: {UserId}", id);
            return NotFound(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (InvalidUserDataException ex)
        {
            _logger.LogWarning(ex, "Invalid user data during update. UserId: {UserId}", id);
            return BadRequest(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Request to update user {UserId} was cancelled.", id);
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while updating the user."));
        }
    }

    /// <summary>
    /// Soft deletes a user.
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <response code="204">User deleted successfully.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="404">User not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteUser(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                _logger.LogWarning("Invalid user ID for deletion: {UserId}", id);
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            var currentUserId = _identityService.GetUserIdentity();

            _logger.LogInformation(
                "Deleting user. UserId: {UserId}, DeletedBy: {DeletedBy}",
                id, currentUserId);

            var result = await _userService.DeleteUserAsync(id, currentUserId, cancellationToken);

            if (!result)
            {
                _logger.LogWarning("User not found for deletion. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            _logger.LogInformation("User deleted successfully. UserId: {UserId}", id);
            return NoContent();
        }
        catch (UserNotFoundException ex)
        {
            _logger.LogWarning(ex, "User not found for deletion. UserId: {UserId}", id);
            return NotFound(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (InvalidUserDataException ex)
        {
            _logger.LogWarning(ex, "Invalid user data during deletion. UserId: {UserId}", id);
            return BadRequest(ApiResponse<object>.FailResponse(ex.Message));
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Request to delete user {UserId} was cancelled.", id);
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while deleting the user."));
        }
    }
}