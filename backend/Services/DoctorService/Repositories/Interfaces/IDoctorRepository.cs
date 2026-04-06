using DoctorService.Models;

namespace DoctorService.Repositories.Interfaces;

public interface IDoctorRepository
{
    Task<Doctor> AddAsync(Doctor doctor);
    Task<Doctor?> GetByIdAsync(int id);
    Task<Doctor?> GetByUserIdAsync(int userId);
    Task<IEnumerable<Doctor>> GetAllAsync();
    Task<IEnumerable<Doctor>> GetVerifiedAsync();
    Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specializationId);
    Task UpdateAsync(Doctor doctor);
}