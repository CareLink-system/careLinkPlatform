using AuthService.Models;

namespace AuthService.Repositories.UserRepository;

public interface IUserRepository
{
    Task<(List<User> Items, int TotalCount)> GetAllAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(
        string email,
        int excludeId,
        CancellationToken cancellationToken = default);

    Task<User> CreateAsync(
        User user,
        CancellationToken cancellationToken = default);

    Task<User?> UpdateAsync(
        User user,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> SoftDeleteAsync(
        int id,
        string deletedBy,
        CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}
