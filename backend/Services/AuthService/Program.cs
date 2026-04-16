using Microsoft.EntityFrameworkCore;
using AuthService;
using AuthService.Data;
using Microsoft.AspNetCore.HttpOverrides;
using DotNetEnv;
//using SharedConfiguration.Extensions;
using System.Reflection;

Console.WriteLine("🚀 Starting AuthService...");

// Load root .env file
//var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".."));
//var envPath = Path.Combine(rootPath, ".env");
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");

if (File.Exists(envPath))
{
    Env.Load(envPath);
    Console.WriteLine($"✅ Loaded .env from: {envPath}");
}
else
{
    Console.WriteLine($"⚠️ .env file not found at: {envPath}");
}


var builder = WebApplication.CreateBuilder(args);

// =====================
// LOAD DATABASE CONFIGURATION
// =====================
var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ;
var dbUsername = Environment.GetEnvironmentVariable("DB_USERNAME");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

if (string.IsNullOrEmpty(dbHost)) throw new Exception("DB_HOST missing");
if (string.IsNullOrEmpty(dbUsername)) throw new Exception("DB_USERNAME missing");
if (string.IsNullOrEmpty(dbPassword)) throw new Exception("DB_PASSWORD missing");

var sslMode = dbHost.Equals("localhost", StringComparison.OrdinalIgnoreCase) ? "Disable" : "Require";

var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUsername};Password={dbPassword};SSL Mode={sslMode};Trust Server Certificate=true;";

builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;

// =====================
// LOAD JWT CONFIGURATION
// =====================
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

if (string.IsNullOrEmpty(jwtKey)) throw new Exception("JWT_KEY missing");
if (string.IsNullOrEmpty(jwtIssuer)) throw new Exception("JWT_ISSUER missing");
if (string.IsNullOrEmpty(jwtAudience)) throw new Exception("JWT_AUDIENCE missing");

builder.Configuration["Jwt:Key"] = jwtKey;
builder.Configuration["Jwt:Issuer"] = jwtIssuer;
builder.Configuration["Jwt:Audience"] = jwtAudience;

// =====================
// LOAD STRIPE (Payment Service only)
// =====================
var stripeKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
if (!string.IsNullOrEmpty(stripeKey))
{
    builder.Configuration["Stripe:SecretKey"] = stripeKey;
}

// =====================
// LOAD AGORA (Telemedicine Service only)
// =====================
var agoraAppId = Environment.GetEnvironmentVariable("AGORA__AppId");
var agoraCertificate = Environment.GetEnvironmentVariable("AGORA__AppCertificate");

if (!string.IsNullOrEmpty(agoraAppId))
{
    builder.Configuration["Agora:AppId"] = agoraAppId;
    builder.Configuration["Agora:AppCertificate"] = agoraCertificate;
}

// Apply shared environment-based configuration
//builder.AddSharedEnvironmentConfiguration();

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
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    c.IncludeXmlComments(xmlPath);
});

// Register application services
builder.Services.RegisterServices(builder.Configuration);

// Add JWT Authentication
//builder.Services.AddJwtAuthentication(builder.Configuration);

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
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth Service API v1");
        c.RoutePrefix = "swagger";
        c.ConfigObject.AdditionalItems["deepLinking"] = true;
        c.ConfigObject.AdditionalItems["displayOperationId"] = true;
        
        Console.WriteLine("Swagger UI configured with endpoint: /api/v1/auth/swagger/v1/swagger.json");
    });

    // Apply migrations in development only
    //app.ApplyMigrations();
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