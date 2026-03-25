using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace ApiGateway.Controllers;

/// <summary>
/// Root endpoint providing API metadata, useful links, and an index of available endpoints.
/// Serves HTML for browsers and JSON for API clients via content negotiation.
/// </summary>
[AllowAnonymous]
[ApiExplorerSettings(IgnoreApi = true)]
public class HomeController(
    IApiDescriptionGroupCollectionProvider apiExplorer,
    IWebHostEnvironment environment,
    IConfiguration configuration,
    LinkGenerator linkGenerator,
    ILogger<HomeController> logger
)
    : Controller
{
    private readonly IApiDescriptionGroupCollectionProvider _apiExplorer =
        apiExplorer ?? throw new ArgumentNullException(nameof(apiExplorer));

    private readonly IConfiguration _configuration =
        configuration ?? throw new ArgumentNullException(nameof(configuration));

    private readonly IWebHostEnvironment _environment =
        environment ?? throw new ArgumentNullException(nameof(environment));

    private readonly LinkGenerator _linkGenerator =
        linkGenerator ?? throw new ArgumentNullException(nameof(linkGenerator));

    private readonly ILogger<HomeController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Returns API home document. HTML for browsers, JSON for API clients.
    /// </summary>
    /// <returns>API home document.</returns>
    [HttpGet("/")]
    [Produces("text/html", "application/json")]
    public IActionResult Index()
    {
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        // Get app name from configuration or use default
        var appName = _configuration["App:Name"] ?? "CareLink API Gateway";

        var meta = new
        {
            name = appName,
            version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "1.0.0",
            environment = _environment.EnvironmentName,
            serverTimeUtc = DateTime.UtcNow,
            description = "Comprehensive Healthcare Platform API Gateway - Connecting patients, doctors, and healthcare services",
            framework = $"ASP.NET Core {Environment.Version}",
            gateway = "YARP Reverse Proxy",
            services = new[]
            {
                new { name = "AuthService", port = 5001, description = "Authentication and authorization" },
                new { name = "PatientService", port = 5002, description = "Patient management and records" },
                new { name = "DoctorService", port = 5003, description = "Doctor profiles and availability" },
                new { name = "AppointmentService", port = 5004, description = "Appointment scheduling and management" },
                new { name = "TelemedicineService", port = 5007, description = "Virtual consultations and telemedicine" },
                new { name = "NotificationService", port = 5008, description = "Notifications and messaging" },
                new { name = "PaymentService", port = 5010, description = "Payment processing and billing" }
            },
            links = new[]
            {
                new { rel = "openapi", href = $"{baseUrl}/swagger/v1/swagger.json", description = "OpenAPI (JSON)" },
                new { rel = "swagger-ui", href = $"{baseUrl}/swagger", description = "Swagger UI" },
                new { rel = "health", href = $"{baseUrl}/health", description = "Liveness/Readiness" },
                new { rel = "dashboard", href = $"{baseUrl}/index.html", description = "Service Dashboard" },
                new
                {
                    rel = "documentation", href = $"{baseUrl}/api/home/documentation", description = "API Documentation"
                }
            }
        };

        // Build endpoint index via ApiExplorer
        var endpoints = _apiExplorer.ApiDescriptionGroups.Items
            .SelectMany(g => g.Items)
            .Where(d => d.RelativePath is not null)
            .Select(d => new
            {
                controller = d.ActionDescriptor.RouteValues.TryGetValue("controller", out var c) ? c : null,
                method = d.HttpMethod,
                path = "/" + d.RelativePath!.TrimStart('/'),
                supportedResponseTypes = d.SupportedResponseTypes.Select(rt => rt.StatusCode).Distinct().OrderBy(x => x)
            })
            .OrderBy(x => x.controller)
            .ThenBy(x => x.path)
            .ThenBy(x => x.method)
            .ToList();

        var accepts = request.Headers["Accept"].ToString();
        var wantsHtml = string.IsNullOrWhiteSpace(accepts) ||
                        accepts.Contains("text/html", StringComparison.OrdinalIgnoreCase);

        if (wantsHtml)
        {
            var html = BuildHtmlHome(meta, endpoints);
            return Content(html, "text/html", Encoding.UTF8);
        }

        return Ok(new { meta, endpoints });
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    /// <returns>Health status</returns>
    [HttpGet("/health")]
    [Produces("application/json")]
    public IActionResult Health()
    {
        try
        {
            var health = new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                uptime = TimeSpan.FromMilliseconds(Environment.TickCount64).ToString(),
                environment = _environment.EnvironmentName,
                version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "Unknown",
                machineName = Environment.MachineName,
                processId = Environment.ProcessId,
                workingSet = $"{Environment.WorkingSet / 1024 / 1024} MB",
                processorCount = Environment.ProcessorCount,
                gateway = new
                {
                    type = "YARP Reverse Proxy",
                    services = new[]
                    {
                        new { name = "AuthService", port = 5001, status = "Configured" },
                        new { name = "PatientService", port = 5002, status = "Configured" },
                        new { name = "DoctorService", port = 5003, status = "Configured" },
                        new { name = "AppointmentService", port = 5004, status = "Configured" },
                        new { name = "TelemedicineService", port = 5007, status = "Configured" },
                        new { name = "NotificationService", port = 5008, status = "Configured" },
                        new { name = "PaymentService", port = 5010, status = "Configured" }
                    }
                }
            };

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(500, new { status = "Unhealthy", error = ex.Message, timestamp = DateTime.UtcNow });
        }
    }

    /// <summary>
    /// Gets API documentation and usage examples
    /// </summary>
    /// <returns>API documentation</returns>
    [HttpGet("/api/home/documentation")]
    [Produces("application/json")]
    public IActionResult GetDocumentation()
    {
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        var appName = _configuration["App:Name"] ?? "CareLink API Gateway";

        var documentation = new
        {
            title = $"{appName} Documentation",
            version = "1.0.0",
            description = "CareLink Platform API Gateway - Comprehensive Healthcare Platform connecting patients, doctors, and healthcare services",
            baseUrl = baseUrl,
            authentication = new
            {
                type = "JWT Bearer Token",
                description = "Most endpoints require authentication",
                header = "Authorization: Bearer {token}",
                registration = "/api/auth/register",
                login = "/api/auth/login"
            },
            commonHeaders = new
            {
                contentType = "application/json",
                accept = "application/json"
            },
            responseFormats = new
            {
                success = new { statusCode = 200, description = "Request successful" },
                created = new { statusCode = 201, description = "Resource created successfully" },
                noContent = new { statusCode = 204, description = "Request successful, no content returned" },
                badRequest = new { statusCode = 400, description = "Invalid request data" },
                unauthorized = new { statusCode = 401, description = "Authentication required" },
                forbidden = new { statusCode = 403, description = "Access denied" },
                notFound = new { statusCode = 404, description = "Resource not found" },
                internalServerError = new { statusCode = 500, description = "Internal server error" }
            },
            coreModules = new[]
            {
                new { name = "Authentication Service", description = "User registration, login, JWT token management", port = 5001 },
                new { name = "Patient Management", description = "Patient profiles, medical records, history", port = 5002 },
                new { name = "Doctor Services", description = "Doctor profiles, specializations, availability", port = 5003 },
                new { name = "Appointment System", description = "Booking, scheduling, appointment management", port = 5004 },
                new { name = "Telemedicine", description = "Virtual consultations, video calls, remote care", port = 5007 },
                new { name = "Notifications", description = "Email, SMS, push notifications for appointments", port = 5008 },
                new { name = "Payment Processing", description = "Secure payment processing, billing, invoices", port = 5010 }
            },
            filteringAndPagination = new
            {
                appointments = new
                {
                    queryParameters = new
                    {
                        status = "Filter by status (Scheduled, Completed, Cancelled)",
                        patientId = "Filter by patient ID",
                        doctorId = "Filter by doctor ID",
                        fromDate = "Filter by start date",
                        toDate = "Filter by end date",
                        page = "Page number (default: 1)",
                        pageSize = "Items per page (default: 20)",
                        sortBy = "Sort field (CreatedAt, AppointmentDate, Status)",
                        sortOrder = "Sort order (asc, desc)"
                    },
                    example = "/api/appointments?status=Scheduled&page=1&pageSize=10&sortBy=AppointmentDate&sortOrder=asc"
                },
                patients = new
                {
                    queryParameters = new
                    {
                        search = "Search by name or email",
                        status = "Filter by status (Active, Inactive)",
                        page = "Page number (default: 1)",
                        pageSize = "Items per page (default: 20)"
                    },
                    example = "/api/patients?search=john&page=1&pageSize=10"
                }
            },
            serviceDiscovery = new
            {
                description = "All services are accessible through this gateway using /api/{service} routes",
                examples = new[]
                {
                    "/api/auth/login",
                    "/api/patients/profile",
                    "/api/doctors/availability",
                    "/api/appointments/book",
                    "/api/telemedicine/sessions",
                    "/api/notifications/send",
                    "/api/payments/process"
                }
            }
        };

        return Ok(documentation);
    }

    private string BuildHtmlHome(object meta, IEnumerable<object> endpoints)
    {
        var appName = _configuration["App:Name"] ?? "CareLink API Gateway";

        // Modern, responsive HTML landing page
        var sb = new StringBuilder();
        sb.Append(
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>");
        sb.Append(appName);
        sb.Append("</title><style>");
        sb.Append(
            "body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;color:#0f172a;background:#fff;line-height:1.6}");
        sb.Append(
            "h1{font-size:32px;margin:0 0 8px;background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}");
        sb.Append(
            "h2{font-size:24px;margin:24px 0 16px;color:#1e293b}h3{font-size:18px;margin:16px 0 8px;color:#334155}");
        sb.Append(
            "p{margin:8px 0;color:#475569}.muted{color:#64748b}.card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;background:#fafafa}");
        sb.Append(".grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}");
        sb.Append(
            "code,kbd{background:#f1f5f9;padding:4px 8px;border-radius:6px;font-family:JetBrains Mono,Consolas,monospace}");
        sb.Append("a{color:#2563eb;text-decoration:none;font-weight:500}a:hover{text-decoration:underline}");
        sb.Append(
            ".endpoints{max-height:500px;overflow:auto;border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fafafa}");
        sb.Append(
            "table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0}");
        sb.Append(
            "th{background:#f8fafc;font-weight:600;color:#374151}.status-badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}");
        sb.Append(
            ".status-healthy{background:#dcfce7;color:#166534}.status-unhealthy{background:#fef2f2;color:#dc2626}");
        sb.Append(
            ".feature-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:16px 0}");
        sb.Append(".feature-item{padding:8px 12px;background:#f1f5f9;border-radius:8px;font-size:14px}");
        sb.Append(".service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0}");
        sb.Append(".service-card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#fff}");
        sb.Append(".service-card h4{margin:0 0 8px;color:#1e293b}.service-card .port{color:#64748b;font-size:14px}");
        sb.Append("</style></head><body>");

        // Header
        sb.Append("<h1>");
        sb.Append(appName);
        sb.Append("</h1>");
        sb.Append(
            "<p class=\"muted\">Comprehensive Healthcare Platform API Gateway - Connecting patients, doctors, and healthcare services</p>");

        // Metadata card
        sb.Append("<div class=\"card\"><h2>API Metadata</h2><pre><code>");
        sb.Append(JsonSerializer.Serialize(meta, new JsonSerializerOptions { WriteIndented = true }));
        sb.Append("</code></pre></div>");

        // Services grid
        sb.Append("<div class=\"card\"><h2>🩺 Healthcare Services</h2><div class=\"service-grid\">");
        sb.Append("<div class=\"service-card\"><h4>🔐 Authentication</h4><p>User registration, login, JWT tokens</p><span class=\"port\">Port: 5001</span></div>");
        sb.Append("<div class=\"service-card\"><h4>👤 Patient Management</h4><p>Profiles, records, medical history</p><span class=\"port\">Port: 5002</span></div>");
        sb.Append("<div class=\"service-card\"><h4>👨‍⚕️ Doctor Services</h4><p>Profiles, specializations, availability</p><span class=\"port\">Port: 5003</span></div>");
        sb.Append("<div class=\"service-card\"><h4>📅 Appointments</h4><p>Booking, scheduling, management</p><span class=\"port\">Port: 5004</span></div>");
        sb.Append("<div class=\"service-card\"><h4>📹 Telemedicine</h4><p>Virtual consultations, video calls</p><span class=\"port\">Port: 5007</span></div>");
        sb.Append("<div class=\"service-card\"><h4>🔔 Notifications</h4><p>Email, SMS, push notifications</p><span class=\"port\">Port: 5008</span></div>");
        sb.Append("<div class=\"service-card\"><h4>💳 Payments</h4><p>Secure payment processing, billing</p><span class=\"port\">Port: 5010</span></div>");
        sb.Append("</div></div>");

        // Quick links grid
        sb.Append("<div class=\"grid\">");
        sb.Append("<div class=\"card\"><h3>📚 Documentation</h3><ul>");
        sb.Append("<li><a href=\"/swagger\" target=\"_blank\">Swagger UI</a></li>");
        sb.Append("<li><a href=\"/api/home/documentation\" target=\"_blank\">API Documentation</a></li>");
        sb.Append("<li><a href=\"/index.html\" target=\"_blank\">Service Dashboard</a></li>");
        sb.Append("</ul></div>");

        sb.Append(
            "<div class=\"card\"><h3>🔧 Authentication</h3><p class=\"muted\">Authorize with <code>Bearer &lt;token&gt;</code> in the <code>Authorization</code> header.</p>");
        sb.Append("<pre><code>curl -H \"Authorization: Bearer &lt;token&gt;\" https://api.example.com/endpoint</code></pre></div>");

        sb.Append("<div class=\"card\"><h3>🏥 Health</h3><p class=\"muted\">Check gateway and service status.</p>");
        sb.Append("<a href=\"/health\" target=\"_blank\">Health Check</a></div>");
        sb.Append("</div>");

        // Endpoints table
        sb.Append(
            "<div class=\"card\"><h2>🔗 Gateway Endpoints</h2><div class=\"endpoints\"><table><thead><tr><th>Method</th><th>Path</th><th>Controller</th><th>Status Codes</th></tr></thead><tbody>");
        foreach (var ep in endpoints)
        {
            var method = ep.GetType().GetProperty("method")?.GetValue(ep)?.ToString() ?? "";
            var path = ep.GetType().GetProperty("path")?.GetValue(ep)?.ToString() ?? "";
            var controller = ep.GetType().GetProperty("controller")?.GetValue(ep)?.ToString() ?? "";
            var statusCodes = ep.GetType().GetProperty("supportedResponseTypes")?.GetValue(ep)?.ToString() ?? "";

            var methodColor = method switch
            {
                "GET" => "#10b981",
                "POST" => "#3b82f6",
                "PUT" => "#f59e0b",
                "PATCH" => "#8b5cf6",
                "DELETE" => "#ef4444",
                _ => "#6b7280"
            };

            sb.Append($"<tr><td><code style=\"color:{methodColor};font-weight:600\">{method}</code></td>");
            sb.Append($"<td><code>{path}</code></td>");
            sb.Append($"<td class=\"muted\">{controller}</td>");
            sb.Append($"<td class=\"muted\">{statusCodes}</td></tr>");
        }

        sb.Append("</tbody></table></div></div>");

        // Footer
        sb.Append(
            $"<p class=\"muted\">&copy; {DateTime.UtcNow.Year} {appName}. Built with ASP.NET Core for comprehensive healthcare services</p>");
        sb.Append("</body></html>");
        return sb.ToString();
    }
}