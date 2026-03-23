namespace DoctorService.DTOs;

public class UpdateAvailabilitySlotDto
{
    public DateTime SlotDate { get; set; }
    public string StartTime { get; set; } = default!;
    public string EndTime { get; set; } = default!;
    public string DayOfWeek { get; set; } = default!;
    public bool IsBooked { get; set; }
    public int? AppointmentId { get; set; }
}