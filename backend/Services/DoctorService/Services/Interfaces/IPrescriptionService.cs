using DoctorService.DTOs;

namespace DoctorService.Services.Interfaces;

public interface IPrescriptionService
{
    Task<PrescriptionResponseDto?> CreatePrescriptionAsync(CreatePrescriptionDto dto, string? createdBy = null);
    Task<PrescriptionResponseDto?> UpdatePrescriptionAsync(int id, UpdatePrescriptionDto dto, string? updatedBy = null, string? currentUserId = null, bool isAdmin = false);
    Task<PrescriptionResponseDto?> GetPrescriptionByIdAsync(int id);
    Task<IEnumerable<PrescriptionResponseDto>> GetAllPrescriptionsAsync();
    Task<IEnumerable<PrescriptionResponseDto>> GetPrescriptionsByDoctorIdAsync(int doctorId);
    Task<IEnumerable<PrescriptionResponseDto>> GetPrescriptionsByPatientIdAsync(int patientId);
    Task<bool> SoftDeletePrescriptionAsync(int id, string? deletedBy = null, string? currentUserId = null, bool isAdmin = false);
}