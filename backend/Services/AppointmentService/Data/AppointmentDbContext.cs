using AppointmentService.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace AppointmentService.Data;

public class AppointmentDbContext : DbContext
{
    public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : base(options)
    {
    }

    public DbSet<Appointment> Appointments { get; set; }
}