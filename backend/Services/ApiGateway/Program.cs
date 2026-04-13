using ApiGateway.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using System.Text;
using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;
using ApiGateway.Filters;

Console.WriteLine("Starting API Gateway.....");

// Configure thread pool
ThreadPool.GetMinThreads(out int workerThreads, out int completionPortThreads);
int newWorkerThreads = Environment.ProcessorCount * 32;
int newCompletionPortThreads = Environment.ProcessorCount * 32;
ThreadPool.SetMinThreads(
    Math.Max(workerThreads, newWorkerThreads),
    Math.Max(completionPortThreads, newCompletionPortThreads));
Console.WriteLine($"Thread pool configured - Worker: {newWorkerThreads}, IO: {newCompletionPortThreads}");

var builder = WebApplication.CreateBuilder(args);

// ── Controllers & Explorer ───────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// ── HttpClient for proxying downstream swagger.json files ────────────────────
builder.Services.AddHttpClient("swagger-proxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    });

// ── JWT Authentication ────────────────────────────────────────────────────────
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
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"] ?? "default-key-for-development"))
        };
    });

// ── YARP Reverse Proxy ────────────────────────────────────────────────────────
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// ── Swagger Services ─────────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CareLink API Gateway",
        Version = "v1",
        Description = "API Gateway for CareLink Platform"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
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
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// ── Swagger UI ────────────────────────────────────────────────────────────────

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Read all downstream service endpoints from config
        var swaggerEndpoints = builder.Configuration
            .GetSection("SwaggerEndpoints")
            .Get<List<SwaggerEndpoint>>() ?? [];

        foreach (var ep in swaggerEndpoints)
        {
            var slug = ep.Name.Replace(" ", "-");
            c.SwaggerEndpoint($"/swagger-proxy/{slug}/swagger.json", ep.Name);
        }

        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "CareLink Platform API";
        c.DefaultModelsExpandDepth(-1);
    });

// ── Static files ──────────────────────────────────────────────────────────────
app.UseStaticFiles();

// ── Standard middleware pipeline ──────────────────────────────────────────────
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// ── Controllers ────────────────────────────────────────────────────────────────
app.MapControllers();

// ── Swagger JSON proxy route ──────────────────────────────────────────────────
app.MapGet("/swagger-proxy/{serviceName}/swagger.json", async (
    string serviceName,
    IHttpClientFactory httpClientFactory,
    IConfiguration config) =>
{
    var endpoints = config
        .GetSection("SwaggerEndpoints")
        .Get<List<SwaggerEndpoint>>();

    var endpoint = endpoints?.FirstOrDefault(e =>
        string.Equals(
            e.Name.Replace(" ", "-"),
            serviceName,
            StringComparison.OrdinalIgnoreCase));

    if (endpoint is null)
        return Results.NotFound($"No swagger endpoint configured for '{serviceName}'.");

    var client = httpClientFactory.CreateClient("swagger-proxy");
    try
    {
        var json = await client.GetStringAsync(endpoint.Url);
        return Results.Content(json, "application/json");
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: $"Could not reach '{serviceName}'",
            detail: ex.Message,
            statusCode: 502);
    }
});

// ── Health endpoint ───────────────────────────────────────────────────────────
app.MapGet("/api/Health", () => Results.Ok(new
{
    service = "CareLink API Gateway",
    status = "Running",
    timestamp = DateTime.UtcNow,
    routes = new[] { "auth", "patients", "doctors", "appointments",
                     "telemedicine", "payments", "notifications", "symptom-checker", "chatbot" }
}));

// ── YARP (must be LAST) ────────────────────────────────────────────────────────
app.MapReverseProxy();

// ── Startup logs ─────────────────────────────────────────────────────────────
Console.WriteLine("API Gateway is ready!");
Console.WriteLine("Swagger Hub  : https://localhost:5000/swagger");
Console.WriteLine("Health Check : https://localhost:5000/api/Health");

if (app.Environment.IsDevelopment())
{
    try
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = "https://localhost:5000/index.html",
            UseShellExecute = true
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not auto-open browser: {ex.Message}");
    }
}

app.Run();