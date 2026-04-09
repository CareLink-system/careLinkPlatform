using PatientService.Models;

namespace PatientService.Repositories.Interfaces;

public interface IPatientRepository
{
    Task<Patient> AddAsync(Patient patient);
    Task<Patient?> GetByIdAsync(int id);
    Task<Patient?> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Patient>> GetAllAsync();
    Task UpdateAsync(Patient patient);
    Task<bool> SoftDeleteAsync(Patient patient);
}