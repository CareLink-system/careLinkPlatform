using System.ComponentModel.DataAnnotations;

namespace PatientService.DTOs
{
    public class CreateMedicalReportDto
    {
        
        public int PatientId { get; set; }

        
        //public int DoctorId { get; set; }

        
        public int AppointmentId { get; set; }
        [Required]
        public string PatientName { get; set; } = default!;

        public DateTime ReportDate { get; set; }

        public string Diagnosis { get; set; } = default!;

        public string? Reports { get; set; } // comma-separated file paths

        public string? Notes { get; set; }

        public string ReportType { get; set; } = default!;
    }

}