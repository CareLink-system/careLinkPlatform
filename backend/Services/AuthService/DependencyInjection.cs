using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Services;
using AuthService.Repositories.UserRepository;
using AuthService.Services.AuthService;
using AuthService.Services.UserService;

namespace AuthService;

public static class DependencyInjection
{
    public static IServiceCollection RegisterServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ✅ Add HttpContextAccessor (required for IdentityService)
        services.AddHttpContextAccessor();

        // ✅ Add DbContext with proper options
        services.AddDbContext<AuthDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // ✅ Register services
        services.AddScoped<IIdentityService, IdentityService>();
        
        // ✅ Register Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        
        // ✅ Register Application Services
        services.AddScoped<IAuthService, AuthenticationService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}