using AppointmentService.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Data;

public class AppointmentDbContext : DbContext
{
    public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options)
        : base(options) { }

    public DbSet<Appointment> Appointments { get; set; }

    // =========================
    // GLOBAL CONFIGURATION
    // =========================
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // SOFT DELETE GLOBAL FILTER
        modelBuilder.Entity<Appointment>()
            .HasQueryFilter(x => !x.IsDeleted);
    }
}