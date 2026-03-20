using AuthService.DTOs.Common;
using AuthService.DTOs.Users;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private static readonly List<User> users = AuthControllerUsersStore.Users;
    private readonly IIdentityService _identityService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IIdentityService identityService, ILogger<UsersController> logger)
    {
        _identityService = identityService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all active users.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        try
        {
            var result = users
                .Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.Email,
                    x.FirstName,
                    x.LastName,
                    x.Role,
                    x.Status,
                    x.PhoneNumber
                })
                .ToList();

            return Ok(ApiResponse<IEnumerable<object>>.SuccessResponse(result, "Users retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving users.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<IEnumerable<object>>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Gets a user by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public IActionResult GetById(int id)
    {
        try
        {
            var user = users.FirstOrDefault(x => x.Id == id && !x.IsDeleted);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role,
                user.Status,
                user.PhoneNumber,
                user.Designation,
                user.FullName
            }, "User retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving user by id.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Updates a user's profile.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto model)
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

            var user = users.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.FirstName = model.FirstName.Trim();
            user.LastName = model.LastName.Trim();
            user.FullName = $"{model.FirstName} {model.LastName}";
            user.PhoneNumber = model.PhoneNumber;
            user.Designation = model.Designation;
            user.Img = model.Img;
            user.Signature = model.Signature;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(null, "User updated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating user.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Soft deletes a user.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var user = users.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            user.DeletedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(null, "User deleted successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting user.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Activates a user.
    /// </summary>
    [HttpPatch("{id:int}/activate")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            var user = users.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.Status = Enum.CommonStatus.Active;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(null, "User activated successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while activating user.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }

    /// <summary>
    /// Suspends a user.
    /// </summary>
    [HttpPatch("{id:int}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Suspend(int id)
    {
        try
        {
            var user = users.FirstOrDefault(x => x.Id == id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.FailResponse("User not found."));
            }

            user.Status = Enum.CommonStatus.Suspended;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = _identityService.GetUserIdentity();

            await Task.CompletedTask;

            return Ok(ApiResponse<object>.SuccessResponse(null, "User suspended successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while suspending user.");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.FailResponse("An unexpected error occurred."));
        }
    }
}