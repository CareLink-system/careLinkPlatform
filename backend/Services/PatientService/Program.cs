using PatientService.Data;
using PatientService.Filters;
using PatientService;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
//using SharedConfiguration.Extensions;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

Console.WriteLine("🚀 Starting PatientService...");

// Load .env
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

// Shared environment-based configuration
//builder.AddSharedEnvironmentConfiguration();


if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

builder.Services.AddAuthorization();
// ---------------------------------------------------------

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Add controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Patient Service API",
        Version = "v1",
        Description = @"
            <h3>Patient Service for CareLink Platform</h3>
            <p>Handles all patient-related operations including:</p>
            <ul>
                <li>Patient registration and profile management</li>
                <li>Medical history tracking</li>
                <li>Patient demographics</li>
                <li>Health records management</li>
            </ul>",
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

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using Bearer scheme"
    });

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
            new string[]{}
        }
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Add filters
    c.OperationFilter<AddRequiredHeaderParameter>();
    c.OperationFilter<AddDefaultResponses>();
});

// Add DbContext
builder.Services.AddDbContext<PatientDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Patient dependencies (Repository + Service)
builder.Services.AddPatientDependencies();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// ---------------- Authentication + Authorization ----------------
app.UseAuthentication(); // MUST come BEFORE UseAuthorization
app.UseAuthorization();
// -----------------------------------------------------------------

app.MapControllers();

// Optional Health Check
app.MapGet("/health", () => Results.Ok(new
{
    service = "PatientService",
    status = "Running",
    timestamp = DateTime.UtcNow
}));

app.Run();