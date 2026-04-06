using DoctorService;
using DoctorService.Data;
using DoctorService.Filters;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using SharedConfiguration.Extensions;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

Console.WriteLine("🚀 Starting DoctorService...");

// Load root .env file
var rootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".."));
var envPath = Path.Combine(rootPath, ".env");

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

// Apply shared environment-based configuration
builder.AddSharedEnvironmentConfiguration();
builder.Services.AddDoctorDependencies();

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

// ✅ ENHANCED: Add Swagger with complete documentation support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Doctor Service API",
        Version = "v1",
        Description = @"
            <h3>Doctor Service for CareLink Platform</h3>
            <p>Handles all doctor-related operations including:</p>
            <ul>
                <li>Doctor registration and profile management</li>
                <li>Availability scheduling</li>
                <li>Specialization tracking</li>
                <li>Consultation management</li>
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
            new[] { "read", "write" }  // Add scopes
        }
    });

    // ✅ Include XML comments (adds descriptions from your code comments)
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // ✅ Add operation filters for better documentation
    c.OperationFilter<AddRequiredHeaderParameter>();
    c.OperationFilter<AddDefaultResponses>();
});

// Add DbContext with Neon DB connection
builder.Services.AddDbContext<DoctorDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply migrations automatically (optional)
//using (var scope = app.Services.CreateScope())
//{
//    var dbContext = scope.ServiceProvider.GetRequiredService<DoctorDbContext>();
//    dbContext.Database.Migrate();
//}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Optional: Keep the weather forecast endpoint if you want
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
