using Microsoft.EntityFrameworkCore;
using PatientService.Models;

namespace PatientService.Data;

public class PatientDbContext : DbContext
{
    public PatientDbContext(DbContextOptions<PatientDbContext> options) : base(options)
    {
    }

    public DbSet<Patient> Patients { get; set; }
    public DbSet<MedicalReport> MedicalReports { get; set; }
}