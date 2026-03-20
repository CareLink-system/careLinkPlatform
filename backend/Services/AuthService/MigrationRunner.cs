using Microsoft.EntityFrameworkCore;
using AuthService.Data;

namespace AuthService;

public static class MigrationRunner
{
    public static void RunMigrations(string[] args)
    {
        // Check if we're running with --migrate flag
        if (args.Length == 1 && args[0] == "--migrate")
        {
            Console.WriteLine("Running migrations...");

            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            try
            {
                // Create DbContext options directly without going through DI
                var optionsBuilder = new DbContextOptionsBuilder<AuthDbContext>();
                optionsBuilder.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));

                // Run migrations
                using var context = new AuthDbContext(optionsBuilder.Options);
                context.Database.Migrate();

                Console.WriteLine("✅ Migrations completed successfully!");
                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Migration failed: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                Environment.Exit(1);
            }
        }
    }
}