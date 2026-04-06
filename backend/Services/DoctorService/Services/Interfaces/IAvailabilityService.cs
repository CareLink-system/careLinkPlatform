using DoctorService.DTOs;

namespace DoctorService.Services.Interfaces;

public interface IAvailabilityService
{
    Task<CreateAvailabilitySlotDto?> CreateSlotAsync(CreateAvailabilitySlotDto dto, string? createdBy = null);
    Task<IEnumerable<object>> GetSlotsByDoctorIdAsync(int doctorId);
    Task<object?> GetSlotByIdAsync(int id);
    Task<object?> UpdateSlotAsync(int id, UpdateAvailabilitySlotDto dto, string? updatedBy = null);
    Task<bool> SoftDeleteSlotAsync(int id, string? deletedBy = null);
}