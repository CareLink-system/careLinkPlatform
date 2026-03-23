namespace DoctorService.DTOs;

public class CreateAvailabilitySlotDto
{
    public int DoctorId { get; set; }
    public DateTime SlotDate { get; set; }
    public string StartTime { get; set; } = default!;
    public string EndTime { get; set; } = default!;
    public string DayOfWeek { get; set; } = default!;
}