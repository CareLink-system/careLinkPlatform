namespace DoctorService.DTOs;

public class DoctorResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SpecializationId { get; set; } = default!;
    public string LicenseNumber { get; set; } = default!;
    public string? Qualifications { get; set; }
    public string? Experience { get; set; }
    public string? Bio { get; set; }
    public double Rating { get; set; }
    public bool IsAvailable { get; set; }
    public string? Department { get; set; }
    public int ConsultationFee { get; set; }
    public bool IsVerified { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}