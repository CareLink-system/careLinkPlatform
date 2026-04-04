using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Services;

namespace PaymentService;

public static class DependencyInjection
{
    public static IServiceCollection RegisterServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        services.AddDbContext<PaymentDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IPaymentService, PaymentService.Services.PaymentService>();
        services.AddScoped<Repositories.IPaymentRepository, Repositories.PaymentRepository>();

        return services;
    }
}
