using ApiGateway.Model;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using System.Text;
using System.Reflection;
using ApiGateway.DTO;
using DotNetEnv;

Console.WriteLine("Starting API Gateway.....");

// Configure thread pool
ThreadPool.GetMinThreads(out int workerThreads, out int completionPortThreads);
int newWorkerThreads = Environment.ProcessorCount * 32;
int newCompletionPortThreads = Environment.ProcessorCount * 32;
ThreadPool.SetMinThreads(
    Math.Max(workerThreads, newWorkerThreads),
    Math.Max(completionPortThreads, newCompletionPortThreads));
Console.WriteLine($"Thread pool configured - Worker: {newWorkerThreads}, IO: {newCompletionPortThreads}");

// =====================
// LOAD .ENV
// =====================
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

// ============================================
// 1. Load ServiceSettings
// ============================================
var serviceSettings = new ServiceSettings();
builder.Configuration.GetSection("ServiceSettings").Bind(serviceSettings);

if (string.IsNullOrWhiteSpace(serviceSettings.DatabaseName))
    throw new InvalidOperationException("ServiceSettings:DatabaseName is missing in appsettings.json");

// ============================================
// 2. Get Environment Variables
// ============================================
var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbUsername = Environment.GetEnvironmentVariable("DB_USERNAME");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var stripeKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

// ============================================
// 3. Validate
// ============================================
if (string.IsNullOrWhiteSpace(dbHost))
    throw new InvalidOperationException("DB_HOST environment variable is missing.");
if (string.IsNullOrWhiteSpace(dbUsername))
    throw new InvalidOperationException("DB_USERNAME environment variable is missing.");
if (string.IsNullOrWhiteSpace(dbPassword))
    throw new InvalidOperationException("DB_PASSWORD environment variable is missing.");

if (string.IsNullOrWhiteSpace(jwtKey))
{
    jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrWhiteSpace(jwtKey))
        throw new InvalidOperationException("JWT_KEY is missing from .env and appsettings.json");
}
jwtIssuer ??= builder.Configuration["Jwt:Issuer"] ?? "careLinkPlatform";
jwtAudience ??= builder.Configuration["Jwt:Audience"] ?? "careLinkPlatformUsers";

if (string.IsNullOrWhiteSpace(stripeKey))
{
    var svcName = serviceSettings.ServiceName?.ToLower() ?? "";
    if (svcName.Contains("payment"))
        throw new InvalidOperationException("STRIPE_SECRET_KEY is missing. Payment Service requires it.");
    Console.WriteLine("⚠️ STRIPE_SECRET_KEY not set. Payment features will not work.");
}

// ============================================
// 4. Build Connection String
// ============================================
var sslMode = Environment.GetEnvironmentVariable("DB_SSL_MODE");
if (string.IsNullOrWhiteSpace(sslMode))
{
    sslMode = dbHost.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
              dbHost == "127.0.0.1" || dbHost == "::1"
        ? "Disable" : "Require";
}

var connectionString =
    $"Host={dbHost};Port={dbPort};Database={serviceSettings.DatabaseName};" +
    $"Username={dbUsername};Password={dbPassword};" +
    $"SSL Mode={sslMode};Trust Server Certificate=true;" +
    $"Timeout=30;Command Timeout=60;Keepalive=30;";

// ============================================
// 5. Push values into Configuration
// ============================================
builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
builder.Configuration["Jwt:Key"] = jwtKey;
builder.Configuration["Jwt:Issuer"] = jwtIssuer;
builder.Configuration["Jwt:Audience"] = jwtAudience;

if (!string.IsNullOrWhiteSpace(stripeKey))
    builder.Configuration["Stripe:SecretKey"] = stripeKey;

// ============================================
// 6. Service URLs → ReverseProxy config
// ============================================
var serviceUrls = new Dictionary<string, (string cluster, string destination)>
{
    ["AUTH_SERVICE_URL"] = ("auth-cluster", "auth"),
    ["PATIENT_SERVICE_URL"] = ("patient-cluster", "patient"),
    ["DOCTOR_SERVICE_URL"] = ("doctor-cluster", "doctor"),
    ["APPOINTMENT_SERVICE_URL"] = ("appointment-cluster", "appointment"),
    ["TELEMEDICINE_SERVICE_URL"] = ("telemedicine-cluster", "telemedicine"),
    ["PAYMENT_SERVICE_URL"] = ("payment-cluster", "payment"),
    ["NOTIFICATION_SERVICE_URL"] = ("notification-cluster", "notification"),
    ["SYMPTOM_CHECK_SERVICE_URL"] = ("symptom-check-cluster", "symptom-check"),
    ["CHATBOT_SERVICE_URL"] = ("chatbot-cluster", "chatbot"),
};

foreach (var (envVar, (cluster, dest)) in serviceUrls)
{
    var url = Environment.GetEnvironmentVariable(envVar);
    Console.WriteLine($"   {envVar}: {url ?? "not set"}");
    if (!string.IsNullOrWhiteSpace(url))
        builder.Configuration[$"ReverseProxy:Clusters:{cluster}:Destinations:{dest}:Address"] = url;
}

// ============================================
// 7. Build SwaggerEndpoints in-memory store
//    (KEY FIX: store in a singleton, not just a local list)
// ============================================
var swaggerEndpoints = new List<SwaggerEndpoint>();

var swaggerEnvVars = new[]
{
    ("AUTH_SWAGGER_URL",          "Auth Service"),
    ("PATIENT_SWAGGER_URL",       "Patient Service"),
    ("DOCTOR_SWAGGER_URL",        "Doctor Service"),
    ("APPOINTMENT_SWAGGER_URL",   "Appointment Service"),
    ("TELEMEDICINE_SWAGGER_URL",  "Telemedicine Service"),
    ("PAYMENT_SWAGGER_URL",       "Payment Service"),
    ("NOTIFICATION_SWAGGER_URL",  "Notification Service"),
    ("SYMPTOM_CHECK_SWAGGER_URL", "Symptom Check Service"),
    ("CHATBOT_SWAGGER_URL",       "Chatbot Service"),
};

foreach (var (envVar, name) in swaggerEnvVars)
{
    var url = Environment.GetEnvironmentVariable(envVar);
    if (!string.IsNullOrWhiteSpace(url))
    {
        swaggerEndpoints.Add(new SwaggerEndpoint { Name = name, Url = url });
        Console.WriteLine($"✅ Swagger endpoint registered: {name} -> {url}");
    }
    else
    {
        Console.WriteLine($"⚠️ {envVar} not set, skipping '{name}' in Swagger UI.");
    }
}

// ============================================
// 8. Register Services
// ============================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// KEY FIX: register swaggerEndpoints as a singleton so the proxy route can inject it
builder.Services.AddSingleton(swaggerEndpoints);

builder.Services.AddHttpClient("swagger-proxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CareLink API Gateway",
        Version = "v1",
        Description = "API Gateway for CareLink Platform"
    });

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
                    { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    var xmlPath = Path.Combine(AppContext.BaseDirectory,
        $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// ============================================
// 9. Build the app
// ============================================
var app = builder.Build();

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    // KEY FIX: use the same in-memory list, not config (which was never written to correctly)
    foreach (var ep in swaggerEndpoints)
    {
        var slug = ep.Name.Replace(" ", "-");
        c.SwaggerEndpoint($"/swagger-proxy/{slug}/swagger.json", ep.Name);
        Console.WriteLine($"Registering Swagger UI tab: {ep.Name} -> /swagger-proxy/{slug}/swagger.json");
    }

    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "CareLink Platform API";
    c.DefaultModelsExpandDepth(-1);
});

app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Swagger JSON proxy ────────────────────────────────────────────────────────
// KEY FIX: inject List<SwaggerEndpoint> from DI, not from IConfiguration
app.MapGet("/swagger-proxy/{serviceName}/swagger.json", async (
    string serviceName,
    IHttpClientFactory httpClientFactory,
    List<SwaggerEndpoint> endpoints) =>          // <-- injected from singleton
{
    var endpoint = endpoints.FirstOrDefault(e =>
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

// ── Health ────────────────────────────────────────────────────────────────────
app.MapGet("/api/Health", () => Results.Ok(new
{
    service = "CareLink API Gateway",
    status = "Running",
    timestamp = DateTime.UtcNow,
    routes = new[] { "auth", "patients", "doctors", "appointments",
                        "telemedicine", "payments", "notifications",
                        "symptom-checker", "chatbot" }
}));

// ── YARP (must be LAST) ───────────────────────────────────────────────────────
app.MapReverseProxy();

// ── Startup logs ──────────────────────────────────────────────────────────────
Console.WriteLine("✅ API Gateway is ready!");
Console.WriteLine($"Swagger UI   : {(app.Environment.IsDevelopment() ? "https://localhost:5000/swagger" : "https://carelinkplatform-apigateway.onrender.com/swagger")}");
Console.WriteLine("Health Check : /api/Health");

if (app.Environment.IsDevelopment())
{
    try { Process.Start(new ProcessStartInfo { FileName = "https://localhost:5000/swagger", UseShellExecute = true }); }
    catch (Exception ex) { Console.WriteLine($"Could not auto-open browser: {ex.Message}"); }
}

app.Run();