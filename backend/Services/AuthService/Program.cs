using Microsoft.EntityFrameworkCore;
using AuthService;
using AuthService.Data;

Console.WriteLine("🚀 Starting AuthService...");

// Check if we should run migrations directly
MigrationRunner.RunMigrations(args);

// Configure thread pool for high concurrency
ThreadPool.GetMinThreads(out int workerThreads, out int completionPortThreads);
int newWorkerThreads = Environment.ProcessorCount * 32;
int newCompletionPortThreads = Environment.ProcessorCount * 32;
ThreadPool.SetMinThreads(
    Math.Max(workerThreads, newWorkerThreads),
    Math.Max(completionPortThreads, newCompletionPortThreads));

Console.WriteLine($"✅ Thread pool configured - Min worker threads: {newWorkerThreads}, Completion ports: {newCompletionPortThreads}");

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Auth Service API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Register application services
builder.Services.RegisterServices(builder.Configuration);

// Add JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AuthDbContext>();

// Configure port for Render (Render expects port 8080 or dynamic)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

var app = builder.Build();

// ========== SWAGGER - ENABLED FOR ALL ENVIRONMENTS ==========
// Remove the Development condition - enable Swagger always for testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth Service API v1");
    c.RoutePrefix = "swagger"; // Swagger at /swagger
});

// Apply migrations (safe to do on startup)
app.ApplyMigrations();

// Middleware order (CRITICAL!)
app.UseCors("AllowAll");           // CORS first
app.UseHttpsRedirection();         // HTTPS redirect
app.UseAuthentication();           // Auth
app.UseAuthorization();            // Authorization
app.MapControllers();              // Map controllers

// Health check endpoint
app.MapHealthChecks("/health");

// Root endpoint - so "/" doesn't return 404
app.MapGet("/", () => Results.Ok(new
{
    service = "AuthService",
    status = "Running",
    environment = app.Environment.EnvironmentName,
    endpoints = new
    {
        health = "/health",
        swagger = "/swagger",
        register = "/api/v1/auth/register",
        login = "/api/v1/auth/login",
        me = "/api/v1/auth/me"
    }
}));

// Weather forecast endpoint
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

Console.WriteLine("✅ AuthService is ready!");
Console.WriteLine($"📝 Swagger: https://{Environment.GetEnvironmentVariable("RENDER_EXTERNAL_HOSTNAME") ?? "localhost"}/swagger");
Console.WriteLine($"❤️ Health: https://{Environment.GetEnvironmentVariable("RENDER_EXTERNAL_HOSTNAME") ?? "localhost"}/health");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}