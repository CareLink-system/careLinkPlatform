using Microsoft.EntityFrameworkCore;
using AppointmentService.Data;
using DotNetEnv;
// using SharedConfiguration.Extensions;
using Microsoft.OpenApi.Models;
using System.Reflection;
using AppointmentService.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

Console.WriteLine("🚀 Starting AppointmentService...");

// =====================
// LOAD .ENV
// =====================
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

// =====================
// SHARED CONFIG
// =====================
//builder.AddSharedEnvironmentConfiguration();

// =====================
// 🔥 FIX: IHttpContextAccessor (IMPORTANT)
// =====================
builder.Services.AddHttpContextAccessor();

// =====================
// DEPENDENCY INJECTION
// =====================
builder.Services.AddAppointmentServices();

// =====================
// CORS
// =====================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// =====================
// CONTROLLERS
// =====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// =====================
// SWAGGER
// =====================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Appointment Service API",
        Version = "v1",
        Description = "Appointment microservice for CareLink platform"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
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
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// =====================
// DATABASE
// =====================
builder.Services.AddDbContext<AppointmentDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// =====================
// AUTH
// =====================

if (string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("JWT Key is missing in configuration!");
}

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.RequireHttpsMetadata = false; // dev only

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// =====================
// PIPELINE
// =====================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

// 🔥 IMPORTANT ORDER (DO NOT CHANGE)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();