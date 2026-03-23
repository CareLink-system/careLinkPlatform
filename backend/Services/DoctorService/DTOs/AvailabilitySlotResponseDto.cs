namespace DoctorService.DTOs;

public class AvailabilitySlotResponseDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime SlotDate { get; set; }
    public string StartTime { get; set; } = default!;
    public string EndTime { get; set; } = default!;
    public bool IsBooked { get; set; }
    public int? AppointmentId { get; set; }
    public string DayOfWeek { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}