using AppointmentService.Models;

namespace AppointmentService.Repositories.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment> AddAsync(Appointment entity);
    Task<Appointment?> GetByIdAsync(int id);
    Task<List<Appointment>> GetAllAsync();

    Task<List<Appointment>> GetByDoctorIdAsync(int doctorId);
    Task<List<Appointment>> GetByPatientIdAsync(int patientId);
    Task<List<Appointment>> GetByAvailabilityIdAsync(int availabilityId);

    Task UpdateAsync(Appointment entity);

    Task DeleteAsync(Appointment entity);
}