namespace TelemedicineService.Models;

public class AppointmentSnapshot
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public string AppointmentStatus { get; set; } = string.Empty;
    public string AppointmentDate { get; set; } = string.Empty;
    public string TimeSlot { get; set; } = string.Empty;
}
