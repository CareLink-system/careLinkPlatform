using AppointmentService.Clients;
using AppointmentService.DTOs;
using AppointmentService.Models;
using AppointmentService.Models.Enums;
using AppointmentService.Repositories.Interfaces;
using AppointmentService.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Globalization;

namespace AppointmentService.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _repo;
    private readonly DoctorClient _doctor;
    private readonly PatientClient _patient;
    private readonly AvailabilityClient _availability;
    private readonly AuthClient _auth;
    private readonly NotificationClient _notification;
    private readonly IHttpContextAccessor _httpContext;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        IAppointmentRepository repo,
        DoctorClient doctor,
        PatientClient patient,
        AvailabilityClient availability,
        AuthClient auth,
        NotificationClient notification,
        IHttpContextAccessor httpContext,
        ILogger<AppointmentService> logger)
    {
        _repo = repo;
        _doctor = doctor;
        _patient = patient;
        _availability = availability;
        _auth = auth;
        _notification = notification;
        _httpContext = httpContext;
        _logger = logger;
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
            Notes = dto.Notes,
            AppointmentStatus = AppointmentStatus.Scheduled,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = GetUserName(),
            IsDeleted = false
        };

        var created = await _repo.AddAsync(entity);
        await SendAppointmentNotifications(created, dto);

        return created;
    }

    private async Task SendAppointmentNotifications(Appointment created, CreateAppointmentDto dto)
    {
        try
        {
            var patientProfile = await _patient.GetById(dto.PatientId);
            var doctorProfile = await _doctor.GetById(dto.DoctorId);

            var patientContact = patientProfile == null
                ? null
                : await _auth.GetUserContactById(patientProfile.UserId.ToString());

            var doctorContact = doctorProfile == null || string.IsNullOrWhiteSpace(doctorProfile.UserId)
                ? null
                : await _auth.GetUserContactById(doctorProfile.UserId);

            var payload = new AppointmentNotificationRequest
            {
                AppointmentId = created.Id.ToString(),
                AppointmentTime = ResolveAppointmentTime(dto),
                PatientName = dto.PatientName,
                PatientEmail = patientContact?.Email ?? string.Empty,
                PatientPhone = !string.IsNullOrWhiteSpace(dto.Phone) ? dto.Phone : patientProfile?.Phone ?? patientContact?.PhoneNumber ?? string.Empty,
                DoctorName = doctorProfile?.DoctorName ?? $"Doctor {dto.DoctorId}",
                DoctorEmail = doctorContact?.Email ?? string.Empty,
                DoctorPhone = doctorContact?.PhoneNumber ?? string.Empty
            };

            var sent = await _notification.SendAppointmentBookedAsync(payload);
            if (!sent)
            {
                _logger.LogWarning("NotificationService returned non-success for appointment {AppointmentId}", created.Id);
            }
        }
        catch (Exception ex)
        {
            // Do not fail appointment creation if downstream notifications are unavailable.
            _logger.LogError(ex, "Failed to trigger notifications for appointment {AppointmentId}", created.Id);
        }
    }

    private static DateTime ResolveAppointmentTime(CreateAppointmentDto dto)
    {
        if (!DateTime.TryParse(dto.AppointmentDate, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var datePart))
        {
            return DateTime.UtcNow;
        }

        var timeCandidate = dto.TimeSlot?.Split('-', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        if (timeCandidate != null && TimeSpan.TryParse(timeCandidate, CultureInfo.InvariantCulture, out var timePart))
        {
            return datePart.Date.Add(timePart);
        }

        return datePart;
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

        //appt.AppointmentDate = dto.AppointmentDate;
        //appt.TimeSlot = dto.TimeSlot;
        appt.AppointmentType = dto.AppointmentType;
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