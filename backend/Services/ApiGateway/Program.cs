using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Diagnostics;

Console.WriteLine("Starting API Gateway.....");

// Configure thread pool
ThreadPool.GetMinThreads(out int workerThreads, out int completionPortThreads);
int newWorkerThreads = Environment.ProcessorCount * 32;
int newCompletionPortThreads = Environment.ProcessorCount * 32;
ThreadPool.SetMinThreads(
    Math.Max(workerThreads, newWorkerThreads),
    Math.Max(completionPortThreads, newCompletionPortThreads));

Console.WriteLine($"Thread pool configured with min worker threads: {newWorkerThreads}, completion port threads: {newCompletionPortThreads}");

var builder = WebApplication.CreateBuilder(args);

// ========== ADD PORT BINDING FOR RENDER ==========
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add CORS for React and Swagger dashboard
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Swagger (ENABLE FOR ALL ENVIRONMENTS)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CareLink API Gateway", Version = "v1" });

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

// Add YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Serve static files (wwwroot folder)
app.UseStaticFiles();

// ========== SWAGGER - ENABLED FOR ALL ENVIRONMENTS ==========
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CareLink API Gateway v1");
    c.RoutePrefix = "swagger";
});

// Middleware order
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapReverseProxy();

// Root endpoint
app.MapGet("/", () => Results.Ok(new
{
    name = "CareLink API Gateway",
    version = "1.0.0",
    status = "Running",
    endpoints = new
    {
        swagger = "/swagger",
        health = "/health",
        dashboard = "/index.html",
        auth = "/api/auth/*",
        patients = "/api/patients/*",
        doctors = "/api/doctors/*",
        appointments = "/api/appointments/*",
        telemedicine = "/api/telemedicine/*",
        notifications = "/api/notifications/*",
        payments = "/api/payments/*"
    }
}));

// Note: health endpoint is provided by HomeController to avoid duplicate routes.

Console.WriteLine("API Gateway is ready!");
Console.WriteLine($"Gateway URL: https://{Environment.GetEnvironmentVariable("RENDER_EXTERNAL_HOSTNAME") ?? "localhost"}/");
Console.WriteLine("Swagger: /swagger");
Console.WriteLine("Health: /health");

app.Run();