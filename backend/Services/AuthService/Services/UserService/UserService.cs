using AuthService.DTOs.Users;
using AuthService.Enum;
using AuthService.Exceptions;
using AuthService.Repositories.UserRepository;
using Microsoft.Extensions.Logging;

namespace AuthService.Services.UserService;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<PaginatedUserResponse> GetAllUsersAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 1000)
            {
                _logger.LogWarning(
                    "Invalid pagination parameters. PageNumber: {PageNumber}, PageSize: {PageSize}",
                    pageNumber, pageSize);
                throw new InvalidUserDataException(
                    "Invalid pagination parameters. PageNumber must be >= 1 and PageSize must be between 1 and 1000.");
            }

            var (users, totalCount) = await _userRepository.GetAllAsync(
                pageNumber, pageSize, searchTerm, cancellationToken);

            var dtos = users.Select(MapToDto).ToList();

            _logger.LogInformation(
                "Retrieved users. Page: {Page}, Size: {Size}, Total: {Total}, Search: {Search}",
                pageNumber, pageSize, totalCount, searchTerm ?? "none");

            return new PaginatedUserResponse
            {
                Data = dtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
        catch (InvalidUserDataException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            throw new InvalidUserDataException($"Failed to retrieve users: {ex.Message}");
        }
    }

    public async Task<UserResponseDto> GetUserByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Fetching user. UserId: {UserId}", id);

            var user = await _userRepository.GetByIdAsync(id, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found. UserId: {UserId}", id);
                throw new UserNotFoundException($"User with ID {id} not found.");
            }

            return MapToDto(user);
        }
        catch (UserNotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user. UserId: {UserId}", id);
            throw new InvalidUserDataException($"Failed to retrieve user: {ex.Message}");
        }
    }

    public async Task<UserResponseDto> UpdateUserAsync(
        int id,
        UserUpdateDto request,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Updating user. UserId: {UserId}", id);

            var user = await _userRepository.GetByIdAsync(id, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for update. UserId: {UserId}", id);
                throw new UserNotFoundException($"User with ID {id} not found.");
            }

            // Update properties
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
            
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Designation))
            {
                user.Designation = request.Designation.Trim();
            }

            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User updated successfully. UserId: {UserId}", id);

            return MapToDto(user);
        }
        catch (UserNotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user. UserId: {UserId}", id);
            throw new InvalidUserDataException($"Failed to update user: {ex.Message}");
        }
    }

    public async Task<bool> DeleteUserAsync(
        int id,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Deleting user. UserId: {UserId}", id);

            var user = await _userRepository.GetByIdAsync(id, cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for deletion. UserId: {UserId}", id);
                throw new UserNotFoundException($"User with ID {id} not found.");
            }

            // Soft delete
            bool result = await _userRepository.SoftDeleteAsync(id, currentUserId, cancellationToken);

            if (result)
            {
                await _userRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("User deleted successfully. UserId: {UserId}", id);
            }

            return result;
        }
        catch (UserNotFoundException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user. UserId: {UserId}", id);
            throw new InvalidUserDataException($"Failed to delete user: {ex.Message}");
        }
    }

    private static UserResponseDto MapToDto(Models.User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            FullName = user.FullName,
            Status = user.Status.ToString(),
            CreatedAt = user.CreatedAt,
            CreatedBy = user.CreatedBy
        };
    }
}
