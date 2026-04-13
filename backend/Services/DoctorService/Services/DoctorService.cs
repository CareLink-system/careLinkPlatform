using DoctorService.DTOs;
using DoctorService.Enum;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using DoctorService.Services.Interfaces;

namespace DoctorService.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _doctorRepository;

    public DoctorService(IDoctorRepository doctorRepository)
    {
        _doctorRepository = doctorRepository;
    }

    public async Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto, string? createdBy = null)
    {
        var existingDoctor = await _doctorRepository.GetByUserIdAsync(dto.UserId);
        if (existingDoctor != null)
        {
            throw new InvalidOperationException("Doctor profile already exists for this user.");
        }

        var doctor = new Doctor
        {
            UserId = dto.UserId,
            SpecializationId = dto.SpecializationId,
            LicenseNumber = dto.LicenseNumber,
            DoctorName = dto.DoctorName,
            Qualifications = dto.Qualifications,
            Experience = dto.Experience,
            Bio = dto.Bio,
            Department = dto.Department,
            ConsultationFee = dto.ConsultationFee,
            IsAvailable = true,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            Status = CommonStatus.Pending
        };

        var createdDoctor = await _doctorRepository.AddAsync(doctor);
        return MapToResponseDto(createdDoctor);
    }

    public async Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync()
    {
        var doctors = await _doctorRepository.GetAllAsync();
        return doctors.Select(MapToResponseDto);
    }

    public async Task<DoctorResponseDto?> GetDoctorByIdAsync(int id)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        return doctor == null ? null : MapToResponseDto(doctor);
    }

    public async Task<IEnumerable<DoctorResponseDto>> GetVerifiedDoctorsAsync()
    {
        var doctors = await _doctorRepository.GetVerifiedAsync();
        return doctors.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<DoctorResponseDto>> GetDoctorsBySpecializationAsync(string specializationId)
    {
        var doctors = await _doctorRepository.GetBySpecializationAsync(specializationId);
        return doctors.Select(MapToResponseDto);
    }

    public async Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto, string? updatedBy = null)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        if (doctor == null)
        {
            return null;
        }

        doctor.SpecializationId = dto.SpecializationId;
        doctor.LicenseNumber = dto.LicenseNumber;
        doctor.DoctorName = dto.DoctorName;
        doctor.Qualifications = dto.Qualifications;
        doctor.Experience = dto.Experience;
        doctor.Bio = dto.Bio;
        doctor.Department = dto.Department;
        doctor.ConsultationFee = dto.ConsultationFee;
        doctor.IsAvailable = dto.IsAvailable;
        doctor.UpdatedAt = DateTime.UtcNow;
        doctor.UpdatedBy = updatedBy;

        await _doctorRepository.UpdateAsync(doctor);
        return MapToResponseDto(doctor);
    }

    public async Task<bool> SoftDeleteDoctorAsync(int id, string? deletedBy = null)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        if (doctor == null)
        {
            return false;
        }

        doctor.IsDeleted = true;
        doctor.DeletedAt = DateTime.UtcNow;
        doctor.DeletedBy = deletedBy;
        doctor.Status = CommonStatus.Deleted;

        await _doctorRepository.UpdateAsync(doctor);
        return true;
    }

    public async Task<DoctorResponseDto?> VerifyDoctorAsync(int id, string? updatedBy = null)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        if (doctor == null)
        {
            return null;
        }

        doctor.IsVerified = true;
        doctor.Status = CommonStatus.Active;
        doctor.UpdatedAt = DateTime.UtcNow;
        doctor.UpdatedBy = updatedBy;

        await _doctorRepository.UpdateAsync(doctor);
        return MapToResponseDto(doctor);
    }

    private static DoctorResponseDto MapToResponseDto(Doctor doctor)
    {
        return new DoctorResponseDto
        {
            Id = doctor.Id,
            UserId = doctor.UserId,
            SpecializationId = doctor.SpecializationId,
            LicenseNumber = doctor.LicenseNumber,
            DoctorName = doctor.DoctorName,
            Qualifications = doctor.Qualifications,
            Experience = doctor.Experience,
            Bio = doctor.Bio,
            Rating = doctor.Rating,
            IsAvailable = doctor.IsAvailable,
            Department = doctor.Department,
            ConsultationFee = doctor.ConsultationFee,
            IsVerified = doctor.IsVerified,
            Status = doctor.Status.ToString(),
            CreatedAt = doctor.CreatedAt
        };
    }

    public async Task<IEnumerable<DoctorResponseDto>> SearchDoctorsAsync(DoctorSearchDto searchDto)
    {
        var doctors = await _doctorRepository.SearchAsync(
            searchDto.SpecializationId,
            searchDto.Department,
            searchDto.IsAvailable,
            searchDto.IsVerified
        );

        return doctors.Select(MapToResponseDto);
    }
}