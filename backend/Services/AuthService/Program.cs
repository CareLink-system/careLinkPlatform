using Microsoft.EntityFrameworkCore;
using AuthService;
using AuthService.Data;
using Microsoft.AspNetCore.HttpOverrides;

Console.WriteLine("🚀 Starting AuthService...");

// Check if we should run migrations directly (skipping the whole application startup)
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

var configuredUrls = builder.Configuration["ASPNETCORE_URLS"] ?? builder.Configuration["urls"] ?? "https://localhost:5001";
Console.WriteLine($"🌐 Kestrel configured URLs: {configuredUrls}");

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

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Auth Service API", Version = "v1" });

    // Add JWT authentication to Swagger
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

var app = builder.Build();

// Configure forwarded headers for reverse proxy
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
});

// CRITICAL FIX: Handle base path for reverse proxy
app.Use((context, next) =>
{
    var request = context.Request;
    var headers = request.Headers;
    
    // Check for forwarded prefix from gateway
    var forwardedPath = headers["X-Forwarded-Prefix"].FirstOrDefault();
    if (!string.IsNullOrEmpty(forwardedPath))
    {
        request.PathBase = forwardedPath;
        Console.WriteLine($"Setting PathBase to: {forwardedPath}");
    }
    
    // Log for debugging
    if (request.Path.Value?.Contains("swagger") == true)
    {
        Console.WriteLine($"Swagger request - Path: {request.Path}, PathBase: {request.PathBase}, Headers: X-Forwarded-Prefix={forwardedPath}");
    }
    
    return next();
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        // Configure Swagger to use the correct base path
        c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
        {
            var headers = httpReq.Headers;
            var forwardedPath = headers["X-Forwarded-Prefix"].FirstOrDefault();
            var forwardedHost = headers["X-Forwarded-Host"].FirstOrDefault();
            var forwardedProto = headers["X-Forwarded-Proto"].FirstOrDefault();
            
            if (!string.IsNullOrEmpty(forwardedPath))
            {
                // Build the correct server URL
                var serverUrl = forwardedPath;
                if (!string.IsNullOrEmpty(forwardedProto) && !string.IsNullOrEmpty(forwardedHost))
                {
                    serverUrl = $"{forwardedProto}://{forwardedHost}{forwardedPath}";
                }
                
                swaggerDoc.Servers = new List<Microsoft.OpenApi.Models.OpenApiServer>
                {
                    new Microsoft.OpenApi.Models.OpenApiServer { Url = serverUrl }
                };
                
                Console.WriteLine($"Swagger configured with server URL: {serverUrl}");
            }
        });
    });
    
    app.UseSwaggerUI(c =>
    {
        // CRITICAL: Use absolute path for Swagger endpoint
        c.SwaggerEndpoint("/api/v1/auth/swagger/v1/swagger.json", "Auth Service API v1");
        c.RoutePrefix = "swagger";
        c.ConfigObject.AdditionalItems["deepLinking"] = true;
        c.ConfigObject.AdditionalItems["displayOperationId"] = true;
        
        Console.WriteLine("Swagger UI configured with endpoint: /api/v1/auth/swagger/v1/swagger.json");
    });

    // Apply migrations in development only
    app.ApplyMigrations();
}

// Enable middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Health check endpoint
app.MapHealthChecks("/health");

// Optional: Keep the weather forecast endpoint
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
Console.WriteLine($"📝 Direct Swagger: https://localhost:5001/swagger");
Console.WriteLine($"📝 Gateway Swagger: https://localhost:5000/api/v1/auth/swagger");
Console.WriteLine($"❤️ Health: /health");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}