namespace DoctorService.DTOs;

public class PrescriptionResponseDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public string Diagnosis { get; set; } = default!;
    public string Medicines { get; set; } = default!;
    public string? Notes { get; set; }
    public DateTime IssuedAt { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}