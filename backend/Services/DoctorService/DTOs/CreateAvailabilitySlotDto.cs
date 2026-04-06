using System.ComponentModel.DataAnnotations;

namespace DoctorService.DTOs;

public class CreateAvailabilitySlotDto
{
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime SlotDate { get; set; }

    [Required]
    public string StartTime { get; set; } = default!;

    [Required]
    public string EndTime { get; set; } = default!;
}