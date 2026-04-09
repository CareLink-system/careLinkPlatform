using System.ComponentModel.DataAnnotations;

namespace PatientService.DTOs
{
    public class UpdateMedicalReportDto
    {
        [Required]
        public string Diagnosis { get; set; } = default!;


        // Optional fields
        [Required]
        public string? Reports { get; set; }  // file paths comma-separated

        public string? Notes { get; set; }

        [Required]
        public string ReportType { get; set; } = default!;

        public DateTime? ReportDate { get; set; }  // optional update
    }
}