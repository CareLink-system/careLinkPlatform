using DoctorService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace DoctorService.Models;

public class Prescription : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int DoctorId { get; set; }

    public Doctor Doctor { get; set; } = default!;

    [Required]
    public int PatientId { get; set; }

    public int? AppointmentId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Diagnosis { get; set; } = default!;

    [Required]
    [MaxLength(2000)]
    public string Medicines { get; set; } = default!;

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}