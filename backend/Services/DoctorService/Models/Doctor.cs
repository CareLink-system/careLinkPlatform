using DoctorService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace DoctorService.Models;

public class Doctor : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string SpecializationId { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    public string LicenseNumber { get; set; } = default!;

    [MaxLength(500)]
    public string? Qualifications { get; set; }

    [MaxLength(100)]
    public string? Experience { get; set; }

    [MaxLength(1000)]
    public string? Bio { get; set; }

    public double Rating { get; set; } = 0;

    public bool IsAvailable { get; set; } = true;

    [MaxLength(100)]
    public string? Department { get; set; }

    [Range(0, int.MaxValue)]
    public int ConsultationFee { get; set; }

    public bool IsVerified { get; set; } = false;

    public ICollection<AvailabilitySlot> AvailabilitySlots { get; set; } = new List<AvailabilitySlot>();
}