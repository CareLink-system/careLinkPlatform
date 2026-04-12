using System.ComponentModel.DataAnnotations;

namespace DoctorService.DTOs;

public class CreateDoctorDto
{
    [Required]
    public string UserId { get; set; }

    [Required]
    public string SpecializationId { get; set; } = default!;

    [Required]
    public string LicenseNumber { get; set; } = default!;

    public string? Qualifications { get; set; }
    public string? Experience { get; set; }
    public string? Bio { get; set; }
    public string? Department { get; set; }

    [Range(0, int.MaxValue)]
    public int ConsultationFee { get; set; }
}