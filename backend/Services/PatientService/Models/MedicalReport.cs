using PatientService.Enum;
using PatientService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace PatientService.Models;

public class MedicalReport : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public int DoctorId { get; set; }

    [Required]
    public int AppointmentId { get; set; }

    [Required]
    public DateTime ReportDate { get; set; }

    [Required]
    public string Diagnosis { get; set; } = default!;

    public string? Prescription { get; set; }

    public string? Notes { get; set; }

    public string? FileUrl { get; set; }

    [Required]
    public string ReportType { get; set; } = default!;
}
