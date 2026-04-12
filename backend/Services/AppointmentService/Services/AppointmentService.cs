using AppointmentService.Clients;
using AppointmentService.DTOs;
using AppointmentService.Models;
using AppointmentService.Models.Enums;
using AppointmentService.Repositories.Interfaces;
using AppointmentService.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AppointmentService.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repo;
    private readonly DoctorClient _doctor;
    private readonly PatientClient _patient;
    private readonly AvailabilityClient _availability;
    private readonly IHttpContextAccessor _httpContext;

    public AppointmentService(
        IAppointmentRepository repo,
        DoctorClient doctor,
        PatientClient patient,
        AvailabilityClient availability,
        IHttpContextAccessor httpContext)
    {
        _repo = repo;
        _doctor = doctor;
        _patient = patient;
        _availability = availability;
        _httpContext = httpContext;
    }

    // ================= HELPERS =================
    private ClaimsPrincipal? User => _httpContext.HttpContext?.User;

    private string GetUserRole()
        => User?.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

    private string GetUserName()
        => User?.FindFirst(ClaimTypes.Name)?.Value ??
           User?.FindFirst(ClaimTypes.Email)?.Value ??
           "System";

    // ================= CREATE =================
    public async Task<Appointment> CreateAsync(CreateAppointmentDto dto)
    {
        if (!await _doctor.Exists(dto.DoctorId))
            throw new Exception("Doctor not found");

        if (!await _patient.Exists(dto.PatientId))
            throw new Exception("Patient not found");

        if (!await _availability.IsAvailable(dto.DoctorAvailabilityId))
            throw new Exception("Slot not available");

        var entity = new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            DoctorAvailabilityId = dto.DoctorAvailabilityId,

            AppointmentDate = dto.AppointmentDate,
            TimeSlot = dto.TimeSlot,
            AppointmentType = dto.AppointmentType,
            Reason = dto.Reason,

            PatientName = dto.PatientName,
            Age = dto.Age,
            Address = dto.Address,
            Phone = dto.Phone,

            AppointmentStatus = AppointmentStatus.Scheduled,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = GetUserName(),
            IsDeleted = false
        };

        return await _repo.AddAsync(entity);
    }

    // ================= READ =================
    public Task<List<Appointment>> GetAllAsync()
        => _repo.GetAllAsync();

    public Task<Appointment?> GetByIdAsync(int id)
        => _repo.GetByIdAsync(id);

    public Task<List<Appointment>> GetByDoctorIdAsync(int doctorId)
        => _repo.GetByDoctorIdAsync(doctorId);

    public Task<List<Appointment>> GetByPatientIdAsync(int patientId)
        => _repo.GetByPatientIdAsync(patientId);

    public Task<List<Appointment>> GetByAvailabilityIdAsync(int availabilityId)
        => _repo.GetByAvailabilityIdAsync(availabilityId);

    // ================= UPDATE =================
    public async Task<bool> UpdateAsync(int id, UpdateAppointmentDto dto)
    {
        var appt = await _repo.GetByIdAsync(id);
        if (appt == null || appt.IsDeleted)
            return false;

        appt.AppointmentDate = dto.AppointmentDate;
        appt.TimeSlot = dto.TimeSlot;
        appt.Reason = dto.Reason;
        appt.Notes = dto.Notes;

        appt.PatientName = dto.PatientName;
        appt.Age = dto.Age;
        appt.Address = dto.Address;
        appt.Phone = dto.Phone;

        appt.UpdatedAt = DateTime.UtcNow;
        appt.UpdatedBy = GetUserName();

        await _repo.UpdateAsync(appt);
        return true;
    }

    // ================= CANCEL =================
    public async Task<bool> CancelAsync(int id)
    {
        var appt = await _repo.GetByIdAsync(id);
        if (appt == null)
            return false;

        appt.AppointmentStatus = AppointmentStatus.Cancelled;

        appt.UpdatedAt = DateTime.UtcNow;
        appt.UpdatedBy = GetUserName();

        await _repo.UpdateAsync(appt);
        return true;
    }

    // ================= SOFT DELETE =================
    public async Task<bool> SoftDeleteAsync(int id)
    {
        var appt = await _repo.GetByIdAsync(id);
        if (appt == null || appt.IsDeleted)
            return false;

        appt.IsDeleted = true;
        appt.DeletedAt = DateTime.UtcNow;
        appt.DeletedBy = GetUserName();

        appt.AppointmentStatus = AppointmentStatus.Cancelled;

        await _repo.UpdateAsync(appt);
        return true;
    }

    // ================= STATUS UPDATE =================
    public async Task<bool> UpdateStatusAsync(int id, AppointmentStatus status)
    {
        var appt = await _repo.GetByIdAsync(id);
        if (appt == null || appt.IsDeleted)
            return false;

        appt.AppointmentStatus = status;

        appt.UpdatedAt = DateTime.UtcNow;
        appt.UpdatedBy = GetUserName();

        await _repo.UpdateAsync(appt);
        return true;
    }
}