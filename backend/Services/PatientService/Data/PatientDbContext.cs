using Microsoft.EntityFrameworkCore;
using PatientService.Models;

namespace PatientService.Data;

public class PatientDbContext : DbContext
{
    public PatientDbContext(DbContextOptions<PatientDbContext> options) : base(options) { }

    public DbSet<Patient> Patients { get; set; } = default!;

    public DbSet<MedicalReport> MedicalReports { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Patient>()
            .HasIndex(p => p.UserId)
            .IsUnique();
    }
}