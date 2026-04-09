using System.ComponentModel.DataAnnotations;

namespace PatientService.DTOs
{
    public class CreateMedicalReportDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        
        public int AppointmentId { get; set; }

        public DateTime ReportDate { get; set; }

        public string Diagnosis { get; set; } = default!;

        public string? Reports { get; set; } // comma-separated file paths

        public string? Notes { get; set; }

        public string ReportType { get; set; } = default!;
    }

}