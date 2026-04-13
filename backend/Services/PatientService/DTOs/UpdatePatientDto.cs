using System.ComponentModel.DataAnnotations;

namespace PatientService.DTOs;

public class UpdatePatientDto
{
    [Required]
    public string FullName { get; set; } = default!;

    [Required]
    public string Phone { get; set; } = default!;

    [Required]
    public string DateOfBirth { get; set; } = default!;

    [Required]
    public string Gender { get; set; } = default!;

    [Required]
    public string BloodGroup { get; set; } = default!;
}