using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;
using SharedConfiguration.Models;

namespace SharedConfiguration.Extensions;

public static class SharedConfigurationExtensions
{
    public static WebApplicationBuilder AddSharedEnvironmentConfiguration(this WebApplicationBuilder builder)
    {
        var serviceSettings = new ServiceSettings();
        builder.Configuration.GetSection("ServiceSettings").Bind(serviceSettings);

        if (string.IsNullOrWhiteSpace(serviceSettings.DatabaseName))
        {
            throw new InvalidOperationException(
                "ServiceSettings:DatabaseName is missing in appsettings.json");
        }

        var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
        var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        var dbUsername = Environment.GetEnvironmentVariable("DB_USERNAME");
        var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                        ?? builder.Configuration["Jwt:Issuer"];
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                          ?? builder.Configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(dbHost) ||
            string.IsNullOrWhiteSpace(dbUsername) ||
            string.IsNullOrWhiteSpace(dbPassword))
        {
            throw new InvalidOperationException(
                "Database environment variables are missing. Check your .env or system environment variables.");
        }

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "JWT_KEY environment variable is missing.");
        }

        var connectionString =
            $"Host={dbHost};" +
            $"Port={dbPort};" +
            $"Database={serviceSettings.DatabaseName};" +
            $"Username={dbUsername};" +
            $"Password={dbPassword};" +
            $"SSL Mode=Require;" +
            $"Trust Server Certificate=true;" +
            $"Timeout=30;" +
            $"Command Timeout=60;" +
            $"Keepalive=30;";

        builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
        builder.Configuration["Jwt:Key"] = jwtKey;
        builder.Configuration["Jwt:Issuer"] = jwtIssuer;
        builder.Configuration["Jwt:Audience"] = jwtAudience;

        return builder;
    }
}