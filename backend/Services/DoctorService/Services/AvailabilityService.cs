using DoctorService.DTOs;
using DoctorService.Enum;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using DoctorService.Services.Interfaces;

namespace DoctorService.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly IAvailabilityRepository _availabilityRepository;
    private readonly IDoctorRepository _doctorRepository;

    public AvailabilityService(
        IAvailabilityRepository availabilityRepository,
        IDoctorRepository doctorRepository)
    {
        _availabilityRepository = availabilityRepository;
        _doctorRepository = doctorRepository;
    }

    public async Task<CreateAvailabilitySlotDto?> CreateSlotAsync(CreateAvailabilitySlotDto dto, string? createdBy = null)
    {
        var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId);
        if (doctor == null)
        {
            return null;
        }

        var slot = new AvailabilitySlot
        {
            DoctorId = dto.DoctorId,
            SlotDate = dto.SlotDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            DayOfWeek = dto.SlotDate.DayOfWeek.ToString(),
            IsBooked = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            Status = CommonStatus.Active
        };

        var createdSlot = await _availabilityRepository.AddAsync(slot);

        return new CreateAvailabilitySlotDto
        {
            DoctorId = createdSlot.DoctorId,
            SlotDate = createdSlot.SlotDate,
            StartTime = createdSlot.StartTime,
            EndTime = createdSlot.EndTime
        };
    }

    public async Task<IEnumerable<object>> GetSlotsByDoctorIdAsync(int doctorId)
    {
        var slots = await _availabilityRepository.GetByDoctorIdAsync(doctorId);

        return slots.Select(slot => new
        {
            slot.Id,
            slot.DoctorId,
            slot.SlotDate,
            slot.StartTime,
            slot.EndTime,
            slot.IsBooked,
            slot.AppointmentId,
            slot.DayOfWeek,
            slot.Status,
            slot.CreatedAt
        });
    }

    public async Task<object?> GetSlotByIdAsync(int id)
    {
        var slot = await _availabilityRepository.GetByIdAsync(id);
        if (slot == null)
        {
            return null;
        }

        return new
        {
            slot.Id,
            slot.DoctorId,
            slot.SlotDate,
            slot.StartTime,
            slot.EndTime,
            slot.IsBooked,
            slot.AppointmentId,
            slot.DayOfWeek,
            slot.Status,
            slot.CreatedAt
        };
    }

    public async Task<object?> UpdateSlotAsync(int id, UpdateAvailabilitySlotDto dto, string? updatedBy = null)
    {
        var slot = await _availabilityRepository.GetByIdAsync(id);
        if (slot == null)
        {
            return null;
        }

        slot.SlotDate = dto.SlotDate;
        slot.StartTime = dto.StartTime;
        slot.EndTime = dto.EndTime;
        slot.IsBooked = dto.IsBooked;
        slot.AppointmentId = dto.AppointmentId;
        slot.DayOfWeek = dto.SlotDate.DayOfWeek.ToString();
        slot.UpdatedAt = DateTime.UtcNow;
        slot.UpdatedBy = updatedBy;

        await _availabilityRepository.UpdateAsync(slot);

        return new
        {
            slot.Id,
            slot.DoctorId,
            slot.SlotDate,
            slot.StartTime,
            slot.EndTime,
            slot.IsBooked,
            slot.AppointmentId,
            slot.DayOfWeek,
            slot.Status,
            slot.UpdatedAt
        };
    }

    public async Task<bool> SoftDeleteSlotAsync(int id, string? deletedBy = null)
    {
        var slot = await _availabilityRepository.GetByIdAsync(id);
        if (slot == null)
        {
            return false;
        }

        slot.IsDeleted = true;
        slot.DeletedAt = DateTime.UtcNow;
        slot.DeletedBy = deletedBy;
        slot.Status = CommonStatus.Deleted;

        await _availabilityRepository.DeleteAsync(slot);
        return true;
    }
}