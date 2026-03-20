using DoctorService.Enum;
using DoctorService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace DoctorService.Models;

public class Doctor : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string SpecializationId { get; set; } = default!;

    [Required]
    public string LicenseNumber { get; set; } = default!;

    public string? Qualifications { get; set; }

    public string? Experience { get; set; }

    public string? Bio { get; set; }

    public double Rating { get; set; } = 0;

    public bool IsAvailable { get; set; } = true;

    public string? Department { get; set; }

    public int ConsultationFee { get; set; }
}
