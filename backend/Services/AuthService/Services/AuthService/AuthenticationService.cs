using AuthService.Data;
using AuthService.DTOs.Auth;
using AuthService.DTOs.Users;
using AuthService.Enum;
using AuthService.Exceptions;
using AuthService.Models;
using AuthService.Repositories.UserRepository;
using Microsoft.Extensions.Logging;

namespace AuthService.Services.AuthService;

public class AuthenticationService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly AuthDbContext _dbContext;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        IUserRepository userRepository,
        AuthDbContext dbContext,
        ILogger<AuthenticationService> logger)
    {
        _userRepository = userRepository;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(
        UserRegisterDto request,
        string currentUserId,
        string userIp,
        CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Check if email already exists
            var emailExists = await _userRepository.ExistsByEmailAsync(
                request.Email.ToLower(), cancellationToken);

            if (emailExists)
            {
                _logger.LogWarning("Registration failed. Email already exists: {Email}", request.Email);
                await transaction.RollbackAsync(cancellationToken);
                throw new DuplicateEmailException($"Email '{request.Email}' is already registered.");
            }

            // Hash password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                FullName = $"{request.FirstName.Trim()} {request.LastName.Trim()}",
                Role = request.Role.Trim(),
                PFNO = request.PFNO ?? string.Empty,
                PhoneNumber = request.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId,
                Status = CommonStatus.Active,
                NoOfLogin = 0,
                NoofAttempt = 0,
                LoginIP = userIp,
                AccessToken = Guid.NewGuid(),
                AccessTokenExpireTime = DateTime.UtcNow.AddHours(1)
            };

            // Save to database
            await _userRepository.CreateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation(
                "User registered successfully. Email: {Email}, UserId: {UserId}",
                user.Email, user.Id);

            // Generate token (simplified - replace with actual JWT generation)
            var token = GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            };
        }
        catch (DuplicateEmailException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Error registering user. Email: {Email}", request.Email);
            throw new InvalidUserDataException($"Failed to register user: {ex.Message}");
        }
    }

    public async Task<AuthResponseDto> LoginAsync(
        UserLoginDto request,
        string userIp,
        CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Find user by email
            var user = await _userRepository.GetByEmailAsync(
                request.Email.ToLower(), cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Login failed. User not found: {Email}", request.Email);
                await transaction.RollbackAsync(cancellationToken);
                throw new InvalidCredentialsException("Invalid email or password.");
            }

            // Verify password
            bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordValid)
            {
                user.NoofAttempt += 1;
                await _userRepository.UpdateAsync(user, cancellationToken);
                await _userRepository.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogWarning(
                    "Login failed. Invalid password attempt. Email: {Email}, Attempts: {Attempts}",
                    request.Email, user.NoofAttempt);

                throw new PasswordMismatchException("Invalid email or password.");
            }

            // Update login info
            user.NoOfLogin += 1;
            user.NoofAttempt = 0;
            user.LoginIP = userIp;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = user.Email;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation(
                "User logged in successfully. Email: {Email}, LoginCount: {LoginCount}",
                user.Email, user.NoOfLogin);

            // Generate token (simplified - replace with actual JWT generation)
            var token = GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            };
        }
        catch (InvalidCredentialsException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        catch (PasswordMismatchException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Error logging in user. Email: {Email}", request.Email);
            throw new InvalidCredentialsException("An error occurred during login.");
        }
    }

    public async Task<bool> ChangePasswordAsync(
        int userId,
        string oldPassword,
        string newPassword,
        string currentUserId,
        CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Change password failed. User not found: {UserId}", userId);
                await transaction.RollbackAsync(cancellationToken);
                throw new UserNotFoundException($"User with ID {userId} not found.");
            }

            // Verify old password
            bool passwordValid = BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash);
            if (!passwordValid)
            {
                _logger.LogWarning("Change password failed. Invalid old password for UserId: {UserId}", userId);
                await transaction.RollbackAsync(cancellationToken);
                throw new PasswordMismatchException("Current password is incorrect.");
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Password changed successfully for UserId: {UserId}", userId);
            return true;
        }
        catch (UserNotFoundException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        catch (PasswordMismatchException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Error changing password for UserId: {UserId}", userId);
            throw new InvalidUserDataException($"Failed to change password: {ex.Message}");
        }
    }

    private string GenerateToken(User user)
    {
        // TODO: Replace with actual JWT token generation
        // This is a placeholder implementation
        return $"jwt-token-{user.Id}-{Guid.NewGuid()}";
    }
}
