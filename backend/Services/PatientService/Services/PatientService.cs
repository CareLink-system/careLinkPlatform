using PatientService.DTOs;
using PatientService.Models;
using PatientService.Repositories.Interfaces;
using PatientService.Services.Interfaces;

namespace PatientService.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;

    public PatientService(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public async Task<PatientResponseDto> CreatePatientAsync(CreatePatientDto dto, string? createdBy = null)
    {
        var existing = await _patientRepository.GetByUserIdAsync(dto.UserId);
        if (existing != null)
            throw new InvalidOperationException("Patient profile already exists for this user.");

        var patient = new Patient
        {
            UserId = dto.UserId,
            FullName = dto.FullName,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            BloodGroup = dto.BloodGroup,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        var created = await _patientRepository.AddAsync(patient);
        return MapToResponseDto(created);
    }


    public async Task<IEnumerable<PatientResponseDto>> GetAllPatientsAsync()
    {
        var patients = await _patientRepository.GetAllAsync();
        return patients.Select(MapToResponseDto);
    }

    public async Task<PatientResponseDto?> GetPatientByIdAsync(int id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        return patient == null ? null : MapToResponseDto(patient);
    }

    public async Task<PatientResponseDto?> GetPatientByUserIdAsync(Guid userId)
    {
        var patient = await _patientRepository.GetByUserIdAsync(userId);
        return patient == null ? null : MapToResponseDto(patient);
    }

    public async Task<PatientResponseDto?> UpdatePatientAsync(int id, UpdatePatientDto dto, string? updatedBy = null)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        if (patient == null)
            return null;

        patient.FullName = dto.FullName;
        patient.Phone = dto.Phone;
        patient.DateOfBirth = dto.DateOfBirth;
        patient.Gender = dto.Gender;
        patient.BloodGroup = dto.BloodGroup;
        patient.UpdatedAt = DateTime.UtcNow;
        patient.UpdatedBy = updatedBy;

        await _patientRepository.UpdateAsync(patient);
        return MapToResponseDto(patient);
    }

    public async Task<bool> SoftDeletePatientAsync(int id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        if (patient == null)
            return false;

        // 1. Soft delete patient record
        // await _patientRepository.SoftDeleteAsync(patient);
        return await _patientRepository.SoftDeleteAsync(patient);

        // 2. Soft delete user in AuthService
        // await _userServiceClient.SoftDeleteUserAsync(patient.UserId);

        //return true;
    }

    private static PatientResponseDto MapToResponseDto(Patient patient)
    {
        return new PatientResponseDto
        {
            Id = patient.Id,
            UserId = patient.UserId,
            FullName = patient.FullName,
            Phone = patient.Phone,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            BloodGroup = patient.BloodGroup,
            Status = patient.Status.ToString(),
            CreatedAt = patient.CreatedAt
        };
    }
}