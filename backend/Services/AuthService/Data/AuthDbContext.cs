using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AuthService.Models;

namespace AuthService.Data;

public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");

            entity.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Role).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Titles).HasMaxLength(20);
            entity.Property(x => x.RefreshToken).HasMaxLength(500);
            entity.Property(x => x.LastLoginIp).HasMaxLength(100);
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("Roles");

            entity.Property(x => x.Description).HasMaxLength(250);
        });

        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        var seedCreatedAt = new DateTime(2026, 3, 21, 0, 0, 0, DateTimeKind.Utc);

        builder.Entity<ApplicationRole>().HasData(
            new ApplicationRole
            {
                Id = new Guid("11111111-1111-1111-1111-111111111111"),
                Name = "Admin",
                NormalizedName = "ADMIN",
                Description = "Administrator",
                CreatedAt = seedCreatedAt,
                ConcurrencyStamp = "11111111-1111-1111-1111-111111111112"
            },
            new ApplicationRole
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Name = "Doctor",
                NormalizedName = "DOCTOR",
                Description = "Doctor",
                CreatedAt = seedCreatedAt,
                ConcurrencyStamp = "22222222-2222-2222-2222-222222222223"
            },
            new ApplicationRole
            {
                Id = new Guid("33333333-3333-3333-3333-333333333333"),
                Name = "Patient",
                NormalizedName = "PATIENT",
                Description = "Patient",
                CreatedAt = seedCreatedAt,
                ConcurrencyStamp = "33333333-3333-3333-3333-333333333334"
            }
        );
    }
}