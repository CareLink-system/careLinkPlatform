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
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IAppointmentService, global::AppointmentService.Services.AppointmentService>();

        services.AddHttpClient<DoctorClient>(c =>
            c.BaseAddress = new Uri("https://localhost:5000"));

        services.AddHttpClient<PatientClient>(c =>
            c.BaseAddress = new Uri("https://localhost:5000"));

        services.AddHttpClient<AvailabilityClient>(c =>
            c.BaseAddress = new Uri("https://localhost:5000"));

        return services;
    }
}