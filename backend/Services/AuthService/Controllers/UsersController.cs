using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.DTOs.Common;
using AuthService.DTOs.Users;
using AuthService.Models;
using System.Security.Claims;

namespace AuthService.Controllers;

// Comment for Testing 
//[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/v1/Auth/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<UsersController> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger<UsersController> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    /// <summary>
    /// Gets all users with optional filtering and pagination.
    /// </summary>
    [HttpGet]
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous] // only for test
    [ProducesResponseType(typeof(ApiResponse<PaginatedUserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedUserResponse>>> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? role = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
            {
                _logger.LogWarning("Invalid pagination parameters. PageNumber: {PageNumber}, PageSize: {PageSize}", pageNumber, pageSize);
                return BadRequest(ApiResponse<object>.FailResponse("Invalid pagination parameters. PageNumber must be >= 1 and PageSize must be between 1 and 100."));
            }

            _logger.LogInformation("Retrieving users. Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}, Role: {Role}",
                pageNumber, pageSize, searchTerm ?? "none", role ?? "all");

            // Build query
            var query = _userManager.Users
                .Where(u => u.status != 99)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Email.Contains(searchTerm) ||
                    (u.FirstName != null && u.FirstName.Contains(searchTerm)) ||
                    (u.LastName != null && u.LastName.Contains(searchTerm)));
            }

            // Apply role filter
            if (!string.IsNullOrWhiteSpace(role))
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role);
                var userIds = usersInRole.Select(u => u.Id);
                query = query.Where(u => userIds.Contains(u.Id));
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var userDtos = new List<UserResponseDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(MapToUserResponseDto(user, roles.FirstOrDefault()));
            }

            var result = new PaginatedUserResponse
            {
                Users = userDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };

            _logger.LogInformation("Users retrieved successfully. Total: {TotalCount}", totalCount);

            return Ok(ApiResponse<PaginatedUserResponse>.SuccessResponse(result, "Users retrieved successfully."));
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
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetUserById(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            _logger.LogInformation("Fetching user. UserId: {UserId}", id);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            _logger.LogInformation("User retrieved successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "User retrieved successfully."));
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
    /// Gets current authenticated user profile.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetCurrentUser()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid token."));
            }

            _logger.LogInformation("Fetching current user. UserId: {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "User profile retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving user profile."));
        }
    }

    /// <summary>
    /// Updates user information.
    /// </summary>
    [HttpPut("{id}")]
    //[Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> UpdateUser(
        string id,
        [FromBody] UserUpdateDtoNew request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Invalid update request for user {UserId}. Errors: {Errors}", id, string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            var currentUserId = GetCurrentUserId();
            _logger.LogInformation("Updating user. UserId: {UserId}, UpdatedBy: {UpdatedBy}", id, currentUserId);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for update. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            // Update user properties
            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Titles = request.Titles ?? user.Titles;
            user.IsActive = request.IsActive ?? user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            if(request.status == 0 || request.status == 99)
            {
                user.IsActive = false;
            } else if (request.status == 1)
            {
                user.IsActive = true;
            }
            user.status = request.status ?? user.status;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = updateResult.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Failed to update user. UserId: {UserId}, Errors: {Errors}", id, string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Failed to update user.", errors));
            }

            // Update role if changed
            if (!string.IsNullOrEmpty(request.Role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, request.Role);
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            _logger.LogInformation("User updated successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "User updated successfully."));
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
    /// Updates current user profile.
    /// </summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> UpdateCurrentUser(
        [FromBody] UpdateCurrentUserRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.FailResponse("Invalid token."));
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.FailResponse("Validation failed.", errors));
            }

            _logger.LogInformation("Updating current user profile. UserId: {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            // Update user properties
            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Titles = request.Titles ?? user.Titles;
            user.UpdatedAt = DateTime.UtcNow;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = updateResult.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.FailResponse("Failed to update profile.", errors));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            _logger.LogInformation("Current user profile updated successfully. UserId: {UserId}", userId);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "Profile updated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating current user profile");
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while updating profile."));
        }
    }

    /// <summary>
    /// Soft deletes a user.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteUser(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID for deletion");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            var currentUserId = GetCurrentUserId();
            _logger.LogInformation("Deleting user. UserId: {UserId}, DeletedBy: {DeletedBy}", id, currentUserId);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for deletion. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            // Soft delete - just mark as inactive
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Failed to delete user. UserId: {UserId}, Errors: {Errors}", id, string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Failed to delete user.", errors));
            }

            _logger.LogInformation("User deleted successfully. UserId: {UserId}", id);
            return NoContent();
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

    /// <summary>
    /// Permanently deletes a user (hard delete - admin only).
    /// </summary>
    [HttpDelete("{id}/permanent")]
    //[Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> PermanentDeleteUser(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID for permanent deletion");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            var currentUserId = GetCurrentUserId();
            _logger.LogInformation("Permanently deleting user. UserId: {UserId}, DeletedBy: {DeletedBy}", id, currentUserId);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for permanent deletion. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Failed to permanently delete user. UserId: {UserId}, Errors: {Errors}", id, string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse("Failed to delete user.", errors));
            }

            _logger.LogInformation("User permanently deleted successfully. UserId: {UserId}", id);
            return NoContent();
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Request to permanently delete user {UserId} was cancelled.", id);
            return StatusCode(499, ApiResponse<object>.FailResponse("Request cancelled."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error permanently deleting user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while deleting the user."));
        }
    }

    /// <summary>
    /// Activates a user (Admin only).
    /// </summary>
    [HttpPut("{id}/activate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> ActivateUser(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID for activation");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            var currentUserId = GetCurrentUserId();
            _logger.LogInformation("Activating user. UserId: {UserId}, ActivatedBy: {ActivatedBy}", id, currentUserId);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for activation. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.FailResponse("Failed to activate user.", errors));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            _logger.LogInformation("User activated successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "User activated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while activating the user."));
        }
    }

    /// <summary>
    /// Deactivates a user (Admin only).
    /// </summary>
    [HttpPut("{id}/deactivate")]
    //[Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> DeactivateUser(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Invalid user ID for deactivation");
                return BadRequest(ApiResponse<object>.FailResponse("Invalid user ID."));
            }

            var currentUserId = GetCurrentUserId();
            _logger.LogInformation("Deactivating user. UserId: {UserId}, DeactivatedBy: {DeactivatedBy}", id, currentUserId);

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User not found for deactivation. UserId: {UserId}", id);
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(ApiResponse<object>.FailResponse("Failed to deactivate user.", errors));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userDto = MapToUserResponseDto(user, roles.FirstOrDefault());

            _logger.LogInformation("User deactivated successfully. UserId: {UserId}", id);
            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(userDto, "User deactivated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user. UserId: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while deactivating the user."));
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private UserResponseDto MapToUserResponseDto(ApplicationUser user, string? role)
    {
        return new UserResponseDto
        {
            Id = user.Id.ToString(),
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Titles = user.Titles,
            Role = role ?? user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt,
            LastLoginIp = user.LastLoginIp
        };
    }
}
