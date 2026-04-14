using AppointmentService.Repositories;
using AppointmentService.Repositories.Interfaces;
using AppointmentService.Services;
using AppointmentService.Services.Interfaces;
using AppointmentService.Clients;

namespace AppointmentService.DependencyInjection;

public static class ServiceRegistration
{
    public static IServiceCollection AddAppointmentServices(this IServiceCollection services)
    {
        var baseUrl = Environment.GetEnvironmentVariable("BASE_SERVICE_URL");

        if (string.IsNullOrEmpty(baseUrl))
            throw new Exception("BASE_SERVICE_URL is not set");

        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentService, global::AppointmentService.Services.AppointmentService>();

        services.AddHttpClient<DoctorClient>(c =>
        {
            c.BaseAddress = new Uri(baseUrl);
        });

        services.AddHttpClient<PatientClient>(c =>
        {
            c.BaseAddress = new Uri(baseUrl);
        });

        services.AddHttpClient<AvailabilityClient>(c =>
        {
            c.BaseAddress = new Uri(baseUrl);
        });

        return services;
    }
}