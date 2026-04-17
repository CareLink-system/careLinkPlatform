using MassTransit;
using PaymentService.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PaymentService;
using DotNetEnv;
//using SharedConfiguration.Extensions;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Stripe;
using Swashbuckle.AspNetCore.SwaggerGen;
using PaymentService.Filters;


Console.WriteLine("🚀 Starting PaymentService...");

// Load root .env file
//var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".."));
//var envPath = Path.Combine(rootPath, ".env");
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");

if (System.IO.File.Exists(envPath))
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

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
// var stripeKey = builder.Configuration["Stripe:SecretKey"];

Console.WriteLine($"Stripe Key loaded: {(string.IsNullOrEmpty(stripeKey) ? "❌ MISSING" : "✅ Loaded")}");

// RabbitMQ + MassTransit
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "rabbitmq", h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
        });
    });
});

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

// Add API explorer for Swagger
builder.Services.AddEndpointsApiExplorer();

// Add persistence and domain services
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
var ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// ✅ ENHANCED: Add Swagger with complete documentation support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Payment Service API",
        Version = "v1",
        Description = @"
            <h3>Payment Service for CareLink Platform</h3>
            <p>Handles all payment-related operations including:</p>
            <ul>
                <li>Processing consultation fees</li>
                <li>Payment history tracking</li>
                <li>Refund management</li>
                <li>Invoice generation</li>
            </ul>
        ",
        Contact = new OpenApiContact
        {
            Name = "CareLink Support",
            Email = "support@carelink.com",
            Url = new Uri("https://carelinkplatform.com")
        },
        License = new OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        },
        TermsOfService = new Uri("https://carelinkplatform.com/terms")
    });

    // ✅ Add JWT Authentication with better description
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = @"
            **JWT Authorization header using the Bearer scheme.**
            
            **How to get token:**
            1. Call POST /api/v1/Auth/login from AuthService
            2. Use credentials: email & password
            3. Copy the 'token' from response
            
            **Example:** Bearer eyJhbGciOiJIUzI1NiIs...
            
            **Token expires:** 24 hours after issue
        "
    });

    // ✅ Add security requirement for all endpoints
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new[] { "read", "write" }
        }
    });

    // ✅ Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (System.IO.File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // ✅ Add operation filters
    c.OperationFilter<AddRequiredHeaderParameter>();
    c.OperationFilter<AddDefaultResponses>();
});

// Register dependency injection
builder.Services.RegisterServices(builder.Configuration);

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default-key-for-development"))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

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

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}