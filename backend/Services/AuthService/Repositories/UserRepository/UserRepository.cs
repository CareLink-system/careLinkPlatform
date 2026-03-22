//using AuthService.Data;
//using AuthService.Enum;
//using AuthService.Models;
//using Microsoft.EntityFrameworkCore;

//namespace AuthService.Repositories.UserRepository;

//public class UserRepository : IUserRepository
//{
//    private readonly AuthDbContext _dbContext;

//    public UserRepository(AuthDbContext dbContext)
//    {
//        _dbContext = dbContext;
//    }

//    public async Task<(List<User> Items, int TotalCount)> GetAllAsync(
//        int pageNumber,
//        int pageSize,
//        string? searchTerm = null,
//        CancellationToken cancellationToken = default)
//    {
//        var query = _dbContext.Users
//            .AsNoTracking()
//            .Where(u => u.Status != CommonStatus.Deleted);

//        if (!string.IsNullOrWhiteSpace(searchTerm))
//        {
//            query = query.Where(u =>
//                EF.Functions.Like(u.Email, $"%{searchTerm}%") ||
//                EF.Functions.Like(u.FirstName, $"%{searchTerm}%") ||
//                EF.Functions.Like(u.LastName, $"%{searchTerm}%"));
//        }

//        var totalCount = await query.CountAsync(cancellationToken);

//        var items = await query
//            .OrderByDescending(u => u.CreatedAt)
//            .Skip((pageNumber - 1) * pageSize)
//            .Take(pageSize)
//            .ToListAsync(cancellationToken);

//        return (items, totalCount);
//    }

//    public async Task<User?> GetByIdAsync(
//        int id,
//        CancellationToken cancellationToken = default)
//    {
//        return await _dbContext.Users
//            .AsNoTracking()
//            .FirstOrDefaultAsync(
//                u => u.Id == id && u.Status != CommonStatus.Deleted,
//                cancellationToken);
//    }

//    public async Task<User?> GetByEmailAsync(
//        string email,
//        CancellationToken cancellationToken = default)
//    {
//        return await _dbContext.Users
//            .FirstOrDefaultAsync(
//                u => u.Email == email && u.Status != CommonStatus.Deleted,
//                cancellationToken);
//    }

//    public async Task<bool> ExistsByEmailAsync(
//        string email,
//        CancellationToken cancellationToken = default)
//    {
//        return await _dbContext.Users
//            .AsNoTracking()
//            .AnyAsync(
//                u => u.Email == email && u.Status != CommonStatus.Deleted,
//                cancellationToken);
//    }

//    public async Task<bool> ExistsByEmailAsync(
//        string email,
//        int excludeId,
//        CancellationToken cancellationToken = default)
//    {
//        return await _dbContext.Users
//            .AsNoTracking()
//            .AnyAsync(
//                u => u.Email == email && u.Id != excludeId && u.Status != CommonStatus.Deleted,
//                cancellationToken);
//    }

//    public async Task<User> CreateAsync(
//        User user,
//        CancellationToken cancellationToken = default)
//    {
//        await _dbContext.Users.AddAsync(user, cancellationToken);
//        return user;
//    }

//    public async Task<User?> UpdateAsync(
//        User user,
//        CancellationToken cancellationToken = default)
//    {
//        _dbContext.Users.Update(user);
//        return user;
//    }

//    public async Task<bool> DeleteAsync(
//        int id,
//        CancellationToken cancellationToken = default)
//    {
//        var user = await _dbContext.Users.FindAsync(new object[] { id }, cancellationToken: cancellationToken);
//        if (user == null)
//            return false;

//        _dbContext.Users.Remove(user);
//        return true;
//    }

//    public async Task<bool> SoftDeleteAsync(
//        int id,
//        string deletedBy,
//        CancellationToken cancellationToken = default)
//    {
//        var user = await _dbContext.Users.FindAsync(new object[] { id }, cancellationToken: cancellationToken);
//        if (user == null)
//            return false;

//        user.IsDeleted = true;
//        user.DeletedAt = DateTime.UtcNow;
//        user.DeletedBy = deletedBy;
//        user.Status = CommonStatus.Deleted;
//        _dbContext.Users.Update(user);
//        return true;
//    }

//    public async Task<int> SaveChangesAsync(
//        CancellationToken cancellationToken = default)
//    {
//        return await _dbContext.SaveChangesAsync(cancellationToken);
//    }
//}
