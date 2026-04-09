using PatientService.Repositories;
using PatientService.Repositories.Interfaces;
using PatientService.Services;
using PatientService.Services.Interfaces;

namespace PatientService;

public static class DependencyInjection
{
    public static IServiceCollection AddPatientDependencies(this IServiceCollection services)
    {
        services.AddScoped<IPatientRepository, PatientRepository>();
        services.AddScoped<IPatientService, PatientService.Services.PatientService>(); // fully qualified

        services.AddScoped<IMedicalReportRepository, MedicalReportRepository>();
        services.AddScoped<IMedicalReportService, MedicalReportService>();

        return services;
    }
}