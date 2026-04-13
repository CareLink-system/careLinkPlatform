using AppointmentService.DTOs;
using AppointmentService.Models;
using AppointmentService.Models.Enums;

namespace AppointmentService.Services.Interfaces;

public interface IAppointmentService
{
    Task<Appointment> CreateAsync(CreateAppointmentDto dto);
    Task<List<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(int id);

    Task<List<Appointment>> GetByDoctorIdAsync(int doctorId);
    Task<List<Appointment>> GetByPatientIdAsync(int patientId);
    Task<List<Appointment>> GetByAvailabilityIdAsync(int availabilityId);

    Task<bool> UpdateAsync(int id, UpdateAppointmentDto dto);
    Task<bool> CancelAsync(int id);

    //  ADD THIS (IMPORTANT)
    Task<bool> SoftDeleteAsync(int id);

    //  ADD STATUS UPDATE (ROLE CONTROLLED)
    Task<bool> UpdateStatusAsync(int id, AppointmentStatus status);
}