using DoctorService.Repositories;
using DoctorService.Repositories.Interfaces;
using DoctorService.Services;
using DoctorService.Services.Interfaces;

namespace DoctorService;

public static class DependencyInjection
{
    public static IServiceCollection AddDoctorDependencies(this IServiceCollection services)
    {
        services.AddScoped<IDoctorRepository, DoctorRepository>();
        services.AddScoped<IAvailabilityRepository, AvailabilityRepository>();
        services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();

        services.AddScoped<IDoctorService, Services.DoctorService>();
        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<IPrescriptionService, PrescriptionService>();

        return services;
    }
}