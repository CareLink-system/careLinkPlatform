using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;
using Swashbuckle.AspNetCore.SwaggerGen;
using SharedConfiguration.Extensions;
using TelemedicineService.Data;
using TelemedicineService.Clients;
using TelemedicineService.Filters;
using TelemedicineService.Models;
using TelemedicineService.Repositories;
using TelemedicineService.Services;

// Load the backend .env so shared DB/JWT config can resolve local development values.
var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".."));
var envPath = Path.Combine(rootPath, ".env");

if (File.Exists(envPath))
{
    Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);

if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
{
    builder.AddSharedEnvironmentConfiguration();
}

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

builder.Services.AddDbContext<TelemedicineDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITelemedicineSessionService, TelemedicineSessionService>();
builder.Services.AddScoped<ITelemedicineSessionRepository, TelemedicineSessionRepository>();

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

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TelemedicineDbContext>();
    await dbContext.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
    ""Id"" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ""AppointmentId"" character varying(32) NOT NULL,
    ""AppointmentNumericId"" integer NOT NULL,
    ""DoctorId"" integer NOT NULL,
    ""PatientId"" integer NOT NULL,
    ""AgoraChannelName"" character varying(128) NOT NULL,
    ""Status"" character varying(32) NOT NULL,
    ""StartedAtUtc"" timestamp with time zone NULL,
    ""EndedAtUtc"" timestamp with time zone NULL,
    ""DurationSeconds"" bigint NOT NULL,
    ""ParticipantsJson"" text NOT NULL,
    ""MessagesJson"" text NOT NULL,
    ""DoctorNotesJson"" text NOT NULL,
    ""CreatedAtUtc"" timestamp with time zone NOT NULL,
    ""UpdatedAtUtc"" timestamp with time zone NOT NULL
);
");

    await dbContext.Database.ExecuteSqlRawAsync(@"
CREATE UNIQUE INDEX IF NOT EXISTS ""IX_telemedicine_sessions_AppointmentId""
ON public.telemedicine_sessions (""AppointmentId"");
");
}

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
