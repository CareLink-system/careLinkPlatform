using PatientService.DTOs;

namespace PatientService.Services.Interfaces;

public interface IPatientService
{
    Task<PatientResponseDto> CreatePatientAsync(CreatePatientDto dto, string? createdBy = null);
    Task<IEnumerable<PatientResponseDto>> GetAllPatientsAsync();
    Task<PatientResponseDto?> GetPatientByIdAsync(int id);
    Task<PatientResponseDto?> GetPatientByUserIdAsync(Guid userId);
    Task<PatientResponseDto?> UpdatePatientAsync(int id, UpdatePatientDto dto, string? updatedBy = null);
    Task<bool> SoftDeletePatientAsync(int id);
}