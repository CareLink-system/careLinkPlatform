using DoctorService.DTOs;

namespace DoctorService.Services.Interfaces;

public interface IDoctorService
{
    Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto, string? createdBy = null);
    Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync();
    Task<DoctorResponseDto?> GetDoctorByIdAsync(int id);

    // ✅ ADD THIS NEW METHOD
    Task<DoctorResponseDto?> GetDoctorByUserIdAsync(string userId);

    Task<IEnumerable<DoctorResponseDto>> GetVerifiedDoctorsAsync();
    Task<IEnumerable<DoctorResponseDto>> GetDoctorsBySpecializationAsync(string specializationId);
    Task<IEnumerable<DoctorResponseDto>> SearchDoctorsAsync(DoctorSearchDto searchDto);
    Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto, string? updatedBy = null);
    Task<bool> SoftDeleteDoctorAsync(int id, string? deletedBy = null);
    Task<DoctorResponseDto?> VerifyDoctorAsync(int id, string? updatedBy = null);
}