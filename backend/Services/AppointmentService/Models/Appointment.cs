using AppointmentService.Enum;
using AppointmentService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models;

public class Appointment : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    public string TimeSlot { get; set; } = default!;

    [Required]
    public string AppointmentType { get; set; } = default!;

    public string? Reason { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string AppointmentStatus { get; set; } = "Scheduled";
}
