using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using SharedConfiguration.Models;

namespace SharedConfiguration.Extensions;

public static class SharedConfigurationExtensions
{
    public static WebApplicationBuilder AddSharedEnvironmentConfiguration(this WebApplicationBuilder builder)
    {
        // ============================================
        // 1. Load ServiceSettings from appsettings.json
        // ============================================
        var serviceSettings = new ServiceSettings();
        builder.Configuration.GetSection("ServiceSettings").Bind(serviceSettings);

        if (string.IsNullOrWhiteSpace(serviceSettings.DatabaseName))
        {
            throw new InvalidOperationException(
                "ServiceSettings:DatabaseName is missing in appsettings.json");
        }

        // ============================================
        // 2. Get Database Environment Variables
        // ============================================
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
        var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        var dbUsername = Environment.GetEnvironmentVariable("DB_USERNAME");
        var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

        // ============================================
        // 3. Get JWT Environment Variables
        // ============================================
        var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

        // ============================================
        // 4. Get Stripe Environment Variable
        // ============================================
        var stripeKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");

        // ============================================
        // 5. Validate Required Database Variables
        // ============================================
        if (string.IsNullOrWhiteSpace(dbHost))
        {
            throw new InvalidOperationException(
                "DB_HOST environment variable is missing. Check your .env file.");
        }

        if (string.IsNullOrWhiteSpace(dbUsername))
        {
            throw new InvalidOperationException(
                "DB_USERNAME environment variable is missing. Check your .env file.");
        }

        if (string.IsNullOrWhiteSpace(dbPassword))
        {
            throw new InvalidOperationException(
                "DB_PASSWORD environment variable is missing. Check your .env file.");
        }

        // ============================================
        // 6. Validate JWT (optional - use defaults if missing)
        // ============================================
        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            // Try to get from appsettings.json as fallback
            jwtKey = builder.Configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "JWT_KEY environment variable is missing. Set it in .env or appsettings.json");
            }
        }

        if (string.IsNullOrWhiteSpace(jwtIssuer))
        {
            jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "careLinkPlatform";
        }

        if (string.IsNullOrWhiteSpace(jwtAudience))
        {
            jwtAudience = builder.Configuration["Jwt:Audience"] ?? "careLinkPlatformUsers";
        }

        // ============================================
        // 7. Validate Stripe (optional - not all services need it)
        // ============================================
        if (string.IsNullOrWhiteSpace(stripeKey))
        {
            // Only throw if this service actually needs Stripe
            // For services without payment, this is optional
            var serviceName = serviceSettings.ServiceName?.ToLower() ?? "";
            if (serviceName.Contains("payment"))
            {
                throw new InvalidOperationException(
                    "STRIPE_SECRET_KEY is missing in .env. Payment Service requires it.");
            }
            // For other services, just log a warning
            Console.WriteLine("⚠️ STRIPE_SECRET_KEY not set. Payment features will not work.");
        }

        // ============================================
        // 8. Determine SSL Mode
        // ============================================
        var sslMode = Environment.GetEnvironmentVariable("DB_SSL_MODE");
        if (string.IsNullOrWhiteSpace(sslMode))
        {
            sslMode = dbHost.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                      dbHost.Equals("127.0.0.1") ||
                      dbHost.Equals("::1")
                ? "Disable"
                : "Require";
        }

        // ============================================
        // 9. Build Connection String
        // ============================================
        var connectionString =
            $"Host={dbHost};" +
            $"Port={dbPort};" +
            $"Database={serviceSettings.DatabaseName};" +
            $"Username={dbUsername};" +
            $"Password={dbPassword};" +
            $"SSL Mode={sslMode};" +
            $"Trust Server Certificate=true;" +
            $"Timeout=30;" +
            $"Command Timeout=60;" +
            $"Keepalive=30;";

        // ============================================
        // 10. Set Configuration Values
        // ============================================
        builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
        builder.Configuration["Jwt:Key"] = jwtKey;
        builder.Configuration["Jwt:Issuer"] = jwtIssuer;
        builder.Configuration["Jwt:Audience"] = jwtAudience;

        if (!string.IsNullOrWhiteSpace(stripeKey))
        {
            builder.Configuration["Stripe:SecretKey"] = stripeKey;
        }

        // ============================================
        // 11. Set Service URLs from Environment (Optional)
        // ============================================
        var authServiceUrl = Environment.GetEnvironmentVariable("AUTH_SERVICE_URL");
        var patientServiceUrl = Environment.GetEnvironmentVariable("PATIENT_SERVICE_URL");
        var doctorServiceUrl = Environment.GetEnvironmentVariable("DOCTOR_SERVICE_URL");
        var appointmentServiceUrl = Environment.GetEnvironmentVariable("APPOINTMENT_SERVICE_URL");
        var telemedicineServiceUrl = Environment.GetEnvironmentVariable("TELEMEDICINE_SERVICE_URL");
        var paymentServiceUrl = Environment.GetEnvironmentVariable("PAYMENT_SERVICE_URL");
        var notificationServiceUrl = Environment.GetEnvironmentVariable("NOTIFICATION_SERVICE_URL");
        var symptomCheckServiceUrl = Environment.GetEnvironmentVariable("SYMPTOM_CHECK_SERVICE_URL");
        var chatbotServiceUrl = Environment.GetEnvironmentVariable("CHATBOT_SERVICE_URL");

        // Set ReverseProxy addresses if environment variables exist
        if (!string.IsNullOrWhiteSpace(authServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:auth-cluster:Destinations:auth:Address"] = authServiceUrl;

        if (!string.IsNullOrWhiteSpace(patientServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:patient-cluster:Destinations:patient:Address"] = patientServiceUrl;

        if (!string.IsNullOrWhiteSpace(doctorServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:doctor-cluster:Destinations:doctor:Address"] = doctorServiceUrl;

        if (!string.IsNullOrWhiteSpace(appointmentServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:appointment-cluster:Destinations:appointment:Address"] = appointmentServiceUrl;

        if (!string.IsNullOrWhiteSpace(telemedicineServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:telemedicine-cluster:Destinations:telemedicine:Address"] = telemedicineServiceUrl;

        if (!string.IsNullOrWhiteSpace(paymentServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:payment-cluster:Destinations:payment:Address"] = paymentServiceUrl;

        if (!string.IsNullOrWhiteSpace(notificationServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:notification-cluster:Destinations:notification:Address"] = notificationServiceUrl;

        if (!string.IsNullOrWhiteSpace(symptomCheckServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:symptom-check-cluster:Destinations:symptom-check:Address"] = symptomCheckServiceUrl;
        
        if (!string.IsNullOrWhiteSpace(chatbotServiceUrl))
            builder.Configuration["ReverseProxy:Clusters:chatbot-cluster:Destinations:chatbot:Address"] = chatbotServiceUrl;

        // ============================================
        // 12. Set Swagger URLs from Environment (Optional)
        // ============================================
        var authSwaggerUrl = Environment.GetEnvironmentVariable("AUTH_SWAGGER_URL");
        var patientSwaggerUrl = Environment.GetEnvironmentVariable("PATIENT_SWAGGER_URL");
        var doctorSwaggerUrl = Environment.GetEnvironmentVariable("DOCTOR_SWAGGER_URL");
        var appointmentSwaggerUrl = Environment.GetEnvironmentVariable("APPOINTMENT_SWAGGER_URL");
        var telemedicineSwaggerUrl = Environment.GetEnvironmentVariable("TELEMEDICINE_SWAGGER_URL");
        var paymentSwaggerUrl = Environment.GetEnvironmentVariable("PAYMENT_SWAGGER_URL");
        var notificationSwaggerUrl = Environment.GetEnvironmentVariable("NOTIFICATION_SWAGGER_URL");
        var symptomCheckSwaggerUrl = Environment.GetEnvironmentVariable("SYMPTOM_CHECK_SWAGGER_URL");
        var chatbotSwaggerUrl = Environment.GetEnvironmentVariable("CHATBOT_SWAGGER_URL");

        // Set Swagger endpoints if environment variables exist
        if (!string.IsNullOrWhiteSpace(authSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:0:Url"] = authSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(patientSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:1:Url"] = patientSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(doctorSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:2:Url"] = doctorSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(appointmentSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:3:Url"] = appointmentSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(telemedicineSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:4:Url"] = telemedicineSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(paymentSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:5:Url"] = paymentSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(notificationSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:6:Url"] = notificationSwaggerUrl;

        if (!string.IsNullOrWhiteSpace(symptomCheckSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:7:Url"] = symptomCheckSwaggerUrl;
        
        if (!string.IsNullOrWhiteSpace(chatbotSwaggerUrl))
            builder.Configuration["SwaggerEndpoints:8:Url"] = chatbotSwaggerUrl;

        return builder;
    }
}