namespace AppointmentService.DTOs;

public class AppointmentNotificationRequest
{
    public string AppointmentId { get; set; } = string.Empty;
    public DateTime AppointmentTime { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientEmail { get; set; } = string.Empty;
    public string PatientPhone { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string DoctorEmail { get; set; } = string.Empty;
    public string DoctorPhone { get; set; } = string.Empty;
}
