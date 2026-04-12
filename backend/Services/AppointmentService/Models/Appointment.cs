using AppointmentService.Models.Common;
using AppointmentService.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace AppointmentService.Models;

public class Appointment : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    public int DoctorAvailabilityId { get; set; }

    public string PatientName { get; set; } = default!;
    public int Age { get; set; }
    public string Address { get; set; } = default!;
    public string Phone { get; set; } = default!;

    [Required]
    public string AppointmentDate { get; set; } = default!;

    [Required]
    public string TimeSlot { get; set; } = default!;

    public string AppointmentType { get; set; } = default!;
    public string? Reason { get; set; }
    public string? Notes { get; set; }

    public AppointmentStatus AppointmentStatus { get; set; } = AppointmentStatus.Scheduled;
}