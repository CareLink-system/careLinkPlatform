namespace DoctorService.DTOs;

public class UpdateDoctorDto
{
    public string SpecializationId { get; set; } = default!;
    public string LicenseNumber { get; set; } = default!;
    public string? Qualifications { get; set; }
    public string? Experience { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; }
    public string? Department { get; set; }
    public int ConsultationFee { get; set; }
}