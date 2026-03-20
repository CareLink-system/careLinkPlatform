using DoctorService.Enum;
using DoctorService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace DoctorService.Models;

public class AvailabilitySlot : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime SlotDate { get; set; }

    [Required]
    public string StartTime { get; set; } = default!;

    [Required]
    public string EndTime { get; set; } = default!;

    public bool IsBooked { get; set; } = false;

    public int? AppointmentId { get; set; }

    public string DayOfWeek { get; set; } = default!;
}
