using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Reflection;
using System.Text;
using Swashbuckle.AspNetCore.SwaggerGen;
using TelemedicineService.Clients;
using TelemedicineService.Filters;
using TelemedicineService.Models;
using TelemedicineService.Repositories;
using TelemedicineService.Services;

// Load .env into environment variables (install DotNetEnv NuGet)
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add CORS (allow the frontend at http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<AppointmentServiceOptions>(
    builder.Configuration.GetSection("Dependencies:AppointmentService"));

builder.Services.AddHttpClient<IAppointmentLookupClient, AppointmentLookupClient>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        // Development-only certificate bypass for local HTTPS service-to-service calls.
        if (builder.Environment.IsDevelopment())
        {
            return new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (request, certificate, chain, errors) =>
                {
                    var host = request?.RequestUri?.Host;
                    return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase);
                }
            };
        }

        return new HttpClientHandler();
    });

builder.Services.AddHttpClient<IUserProfileLookupClient, UserProfileLookupClient>()
    .ConfigurePrimaryHttpMessageHandler(() =>
    {
        if (builder.Environment.IsDevelopment())
        {
            return new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (request, certificate, chain, errors) =>
                {
                    var host = request?.RequestUri?.Host;
                    return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase);
                }
            };
        }

        return new HttpClientHandler();
    });

var mongoConnectionString =
    Environment.GetEnvironmentVariable("MONGO_URI") ??
    builder.Configuration["Mongo:ConnectionString"] ??
    "mongodb://localhost:27017";

var mongoDatabaseName =
    Environment.GetEnvironmentVariable("MONGO_DB") ??
    builder.Configuration["ServiceSettings:DatabaseName"] ??
    "carelink_telemedicine";

builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoConnectionString));
builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<IMongoClient>().GetDatabase(mongoDatabaseName));

builder.Services.AddScoped<ITelemedicineSessionService, TelemedicineSessionService>();
builder.Services.AddSingleton<ITelemedicineSessionRepository, TelemedicineSessionRepository>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT Key is missing in configuration.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ✅ ENHANCED: Add Swagger with complete documentation support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Telemedicine Service API",
        Version = "v1",
        Description = @"
            <h3>Telemedicine Service for CareLink Platform</h3>
            <p>Handles all telemedicine-related operations including:</p>
            <ul>
                <li>Video consultation management</li>
                <li>Call session tracking</li>
                <li>Consultation recording</li>
                <li>Real-time communication</li>
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

    // ✅ Add JWT Authentication
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
        "
    });

    // ✅ Add security requirement
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
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // ✅ Add operation filters
    c.OperationFilter<AddRequiredHeaderParameter>();
    c.OperationFilter<AddDefaultResponses>();
});


var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("LocalFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
