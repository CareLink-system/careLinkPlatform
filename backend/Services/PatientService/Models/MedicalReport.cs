using PatientService.Enum;
using PatientService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace PatientService.Models;

public class MedicalReport : AuditableEntity
{
    public int Id { get; set; }

    
    public int PatientId { get; set; }

    
    //public int DoctorId { get; set; }

  
    public int AppointmentId { get; set; }
    [Required]
    public string PatientName { get; set; } = default!;

    [Required]
    public DateTime ReportDate { get; set; }

    [Required]
    public string Diagnosis { get; set; } = default!;

    // Store multiple file paths as comma-separated string
    public string? Reports { get; set; }

    public string? Notes { get; set; }

    [Required]
    public string ReportType { get; set; } = default!;
}