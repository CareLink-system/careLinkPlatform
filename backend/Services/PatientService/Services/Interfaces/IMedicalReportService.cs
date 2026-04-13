using PatientService.DTOs;

namespace PatientService.Services.Interfaces
{
    public interface IMedicalReportService
    {
        Task<MedicalReportResponseDto?> CreateMedicalReportAsync(CreateMedicalReportDto dto, string? createdBy = null);
        Task<MedicalReportResponseDto?> GetMedicalReportByIdAsync(int id);
        Task<IEnumerable<MedicalReportResponseDto>> GetAllMedicalReportsAsync();
        Task<IEnumerable<MedicalReportResponseDto>> GetByPatientIdAsync(int patientId);
        //Task<IEnumerable<MedicalReportResponseDto>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<MedicalReportResponseDto>> GetByAppointmentIdAsync(int appointmentId);
        Task<bool> UpdateMedicalReportAsync(int id, UpdateMedicalReportDto dto, string? updatedBy = null);
        Task<bool> SoftDeleteMedicalReportAsync(int id, string? deletedBy = null);
    }
}