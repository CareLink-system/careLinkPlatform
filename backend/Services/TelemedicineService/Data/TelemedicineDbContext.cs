using Microsoft.EntityFrameworkCore;
using TelemedicineService.Models;

namespace TelemedicineService.Data;

public class TelemedicineDbContext : DbContext
{
    public TelemedicineDbContext(DbContextOptions<TelemedicineDbContext> options) : base(options)
    {
    }

    public DbSet<TelemedicineSession> TelemedicineSessions => Set<TelemedicineSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TelemedicineSession>(entity =>
        {
            entity.ToTable("telemedicine_sessions", "public");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.AppointmentId).IsUnique();

            entity.Property(x => x.AppointmentId).IsRequired().HasMaxLength(32);
            entity.Property(x => x.AgoraChannelName).IsRequired().HasMaxLength(128);
            entity.Property(x => x.Status).IsRequired().HasMaxLength(32);
            entity.Property(x => x.ParticipantsJson).IsRequired();
            entity.Property(x => x.MessagesJson).IsRequired();
            entity.Property(x => x.DoctorNotesJson).IsRequired();
        });
    }
}
