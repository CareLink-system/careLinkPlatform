using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AuthService.Data;

namespace AuthService;

public static class ServiceExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtKey = configuration["Jwt:Key"];
        var jwtIssuer = configuration["Jwt:Issuer"];
        var jwtAudience = configuration["Jwt:Audience"];

        // Development-safe fallbacks so authorized endpoints do not crash when Jwt settings are missing.
        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            jwtKey = "carelink-dev-jwt-key-minimum-32-characters-long";
            Console.WriteLine("⚠️ Jwt:Key is missing. Using development fallback key.");
        }

        if (string.IsNullOrWhiteSpace(jwtIssuer))
        {
            jwtIssuer = "careLinkPlatform";
            Console.WriteLine("⚠️ Jwt:Issuer is missing. Using development fallback issuer.");
        }

        if (string.IsNullOrWhiteSpace(jwtAudience))
        {
            jwtAudience = "careLinkPlatformUsers";
            Console.WriteLine("⚠️ Jwt:Audience is missing. Using development fallback audience.");
        }

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey))
                };
            });

        return services;
    }

    public static IApplicationBuilder ApplyMigrations(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        dbContext.Database.Migrate();

        Console.WriteLine("✅ Database migrations applied successfully");
        return app;
    }
}