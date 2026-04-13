namespace AppointmentService.DTOs;

public class CreateAppointmentDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int DoctorAvailabilityId { get; set; }

    public string AppointmentDate { get; set; } = default!;
    public string TimeSlot { get; set; } = default!;

    public string AppointmentType { get; set; } = default!;
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public string PatientName { get; set; } = default!;
    public int Age { get; set; }
    public string Address { get; set; } = default!;
    public string Phone { get; set; } = default!;
}