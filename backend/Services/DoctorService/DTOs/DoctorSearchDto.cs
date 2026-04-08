namespace DoctorService.DTOs;

public class DoctorSearchDto
{
    public string? SpecializationId { get; set; }
    public string? Department { get; set; }
    public bool? IsAvailable { get; set; }
    public bool? IsVerified { get; set; }
}