using PatientService.Models;

namespace PatientService.Repositories.Interfaces
{
    public interface IMedicalReportRepository
    {
        Task<MedicalReport> AddAsync(MedicalReport report);
        Task<MedicalReport?> GetByIdAsync(int id);
        Task<IEnumerable<MedicalReport>> GetAllAsync();
        Task<IEnumerable<MedicalReport>> GetByPatientIdAsync(int patientId);
        //Task<IEnumerable<MedicalReport>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<MedicalReport>> GetByAppointmentIdAsync(int appointmentId);
        Task UpdateAsync(MedicalReport report);
    }
}