using System.ComponentModel.DataAnnotations;

namespace PatientService.DTOs
{ 
    public class MedicalReportResponseDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        //public int DoctorId { get; set; }
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = default!;
        public DateTime ReportDate { get; set; }
        public string Diagnosis { get; set; } = default!;
        public string? Reports { get; set; }
        public string? Notes { get; set; }
        public string ReportType { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}