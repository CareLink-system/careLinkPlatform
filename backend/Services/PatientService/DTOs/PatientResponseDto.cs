namespace PatientService.DTOs;

public class PatientResponseDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string DateOfBirth { get; set; } = default!;
    public string Gender { get; set; } = default!;
    public string BloodGroup { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}