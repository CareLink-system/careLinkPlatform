using DoctorService.Models;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace DoctorService.Data;

public class DoctorDbContext : DbContext
{
    public DoctorDbContext(DbContextOptions<DoctorDbContext> options) : base(options)
    {
    }

    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<AvailabilitySlot> AvailabilitySlots { get; set; }
}