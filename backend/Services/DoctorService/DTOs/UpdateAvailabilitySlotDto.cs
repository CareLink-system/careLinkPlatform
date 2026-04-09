using System.ComponentModel.DataAnnotations;

namespace DoctorService.DTOs;

public class UpdateAvailabilitySlotDto
{
    [Required]
    public DateTime SlotDate { get; set; }

    [Required]
    public string StartTime { get; set; } = default!;

    [Required]
    public string EndTime { get; set; } = default!;

    public bool IsBooked { get; set; }
    public int? AppointmentId { get; set; }
}