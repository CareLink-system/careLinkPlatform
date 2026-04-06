using DoctorService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace DoctorService.Models;

public class AvailabilitySlot : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int DoctorId { get; set; }

    public Doctor Doctor { get; set; } = default!;

    [Required]
    public DateTime SlotDate { get; set; }

    [Required]
    [MaxLength(10)]
    public string StartTime { get; set; } = default!;

    [Required]
    [MaxLength(10)]
    public string EndTime { get; set; } = default!;

    public bool IsBooked { get; set; } = false;

    public int? AppointmentId { get; set; }

    [MaxLength(20)]
    public string? DayOfWeek { get; set; }
}