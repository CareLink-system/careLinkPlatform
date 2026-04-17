using System.ComponentModel.DataAnnotations;

namespace DoctorService.DTOs;

public class UpdatePrescriptionDto
{
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public int PatientId { get; set; }

    public int? AppointmentId { get; set; }

    [Required]
    public string Diagnosis { get; set; } = default!;

    [Required]
    public string Medicines { get; set; } = default!;

    public string? Notes { get; set; }
}
