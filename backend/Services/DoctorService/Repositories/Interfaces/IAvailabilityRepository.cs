using DoctorService.Models;

namespace DoctorService.Repositories.Interfaces;

public interface IAvailabilityRepository
{
    Task<AvailabilitySlot> AddAsync(AvailabilitySlot slot);
    Task<AvailabilitySlot?> GetByIdAsync(int id);
    Task<IEnumerable<AvailabilitySlot>> GetByDoctorIdAsync(int doctorId);
    Task<IEnumerable<AvailabilitySlot>> GetByDoctorIdAndDateAsync(int doctorId, DateTime slotDate);
    Task UpdateAsync(AvailabilitySlot slot);
    Task DeleteAsync(AvailabilitySlot slot);
}