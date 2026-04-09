using DoctorService.Models;

namespace DoctorService.Repositories.Interfaces;

public interface IPrescriptionRepository
{
    Task<Prescription> AddAsync(Prescription prescription);
    Task<Prescription?> GetByIdAsync(int id);
    Task<IEnumerable<Prescription>> GetByDoctorIdAsync(int doctorId);
    Task<IEnumerable<Prescription>> GetByPatientIdAsync(int patientId);
    Task<IEnumerable<Prescription>> GetAllAsync();
    Task UpdateAsync(Prescription prescription);
}