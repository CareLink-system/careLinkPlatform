using DoctorService.DTOs;
using DoctorService.Enum;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using DoctorService.Services.Interfaces;

namespace DoctorService.Services;

public class PrescriptionService : IPrescriptionService
{
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly IDoctorRepository _doctorRepository;

    public PrescriptionService(
        IPrescriptionRepository prescriptionRepository,
        IDoctorRepository doctorRepository)
    {
        _prescriptionRepository = prescriptionRepository;
        _doctorRepository = doctorRepository;
    }

    public async Task<PrescriptionResponseDto?> CreatePrescriptionAsync(CreatePrescriptionDto dto, string? createdBy = null)
    {
        var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId);
        if (doctor == null)
        {
            return null;
        }

        var prescription = new Prescription
        {
            DoctorId = dto.DoctorId,
            PatientId = dto.PatientId,
            AppointmentId = dto.AppointmentId,
            Diagnosis = dto.Diagnosis,
            Medicines = dto.Medicines,
            Notes = dto.Notes,
            IssuedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            Status = CommonStatus.Active
        };

        var createdPrescription = await _prescriptionRepository.AddAsync(prescription);
        return MapToResponseDto(createdPrescription);
    }

    public async Task<IEnumerable<PrescriptionResponseDto>> GetAllPrescriptionsAsync()
    {
        var prescriptions = await _prescriptionRepository.GetAllAsync();
        return prescriptions.Select(MapToResponseDto);
    }

    public async Task<PrescriptionResponseDto?> GetPrescriptionByIdAsync(int id)
    {
        var prescription = await _prescriptionRepository.GetByIdAsync(id);
        return prescription == null ? null : MapToResponseDto(prescription);
    }

    public async Task<IEnumerable<PrescriptionResponseDto>> GetPrescriptionsByDoctorIdAsync(int doctorId)
    {
        var prescriptions = await _prescriptionRepository.GetByDoctorIdAsync(doctorId);
        return prescriptions.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<PrescriptionResponseDto>> GetPrescriptionsByPatientIdAsync(int patientId)
    {
        var prescriptions = await _prescriptionRepository.GetByPatientIdAsync(patientId);
        return prescriptions.Select(MapToResponseDto);
    }

    public async Task<bool> SoftDeletePrescriptionAsync(int id, string? deletedBy = null)
    {
        var prescription = await _prescriptionRepository.GetByIdAsync(id);
        if (prescription == null)
        {
            return false;
        }

        prescription.IsDeleted = true;
        prescription.DeletedAt = DateTime.UtcNow;
        prescription.DeletedBy = deletedBy;
        prescription.Status = CommonStatus.Deleted;

        await _prescriptionRepository.UpdateAsync(prescription);
        return true;
    }

    private static PrescriptionResponseDto MapToResponseDto(Prescription prescription)
    {
        return new PrescriptionResponseDto
        {
            Id = prescription.Id,
            DoctorId = prescription.DoctorId,
            PatientId = prescription.PatientId,
            AppointmentId = prescription.AppointmentId,
            Diagnosis = prescription.Diagnosis,
            Medicines = prescription.Medicines,
            Notes = prescription.Notes,
            IssuedAt = prescription.IssuedAt,
            Status = prescription.Status.ToString(),
            CreatedAt = prescription.CreatedAt
        };
    }
}