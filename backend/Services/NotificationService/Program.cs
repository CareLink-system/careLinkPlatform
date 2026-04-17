using MassTransit;
using NotificationService.Events;
using NotificationService.Consumers;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;
using NotificationService.Filters;
using DotNetEnv;
using MongoDB.Driver;
using NotificationService.Models;
using NotificationService.Options;
using NotificationService.Services;

if (File.Exists(".env"))
{
    Env.Load(".env");
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoOptions>(builder.Configuration.GetSection(MongoOptions.SectionName));
builder.Services.Configure<NotificationProvidersOptions>(builder.Configuration.GetSection(NotificationProvidersOptions.SectionName));

var mongoConnectionString = builder.Configuration["Mongo:ConnectionString"] ?? Environment.GetEnvironmentVariable("MONGO_URI") ?? string.Empty;
var mongoDatabaseName = builder.Configuration["Mongo:DatabaseName"] ?? Environment.GetEnvironmentVariable("MONGO_DB") ?? "notifications";
var mongoCollectionName = builder.Configuration["Mongo:CollectionName"] ?? "notificationRecords";

if (string.IsNullOrWhiteSpace(mongoConnectionString))
{
    throw new InvalidOperationException("MongoDB connection string is not configured. Set Mongo:ConnectionString or MONGO_URI.");
}

builder.Services.AddSingleton<IMongoCollection<NotificationRecord>>(_ =>
{
    var client = new MongoClient(mongoConnectionString);
    var database = client.GetDatabase(mongoDatabaseName);
    return database.GetCollection<NotificationRecord>(mongoCollectionName);
});

builder.Services.AddHttpClient<IEmailService, EmailService>();
builder.Services.AddHttpClient<ISmsService, SmsService>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<PaymentCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "rabbitmq", h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
        });

        cfg.ReceiveEndpoint("payment-created-event-queue", ep =>
        {
            ep.ConfigureConsumer<PaymentCreatedConsumer>(context);
        });
    });
});

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
        Title = "Notification Service API",
        Version = "v1",
        Description = @"
            <h3>Notification Service for CareLink Platform</h3>
            <p>Handles all notification-related operations including:</p>
            <ul>
                <li>Event-driven notifications</li>
                <li>Email notifications</li>
                <li>SMS notifications</li>
                <li>Push notifications</li>
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
            
            **Example:** Bearer eyJhbGciOiJIUzI1NiIs...
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
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
