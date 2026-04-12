using AppointmentService.Data;
using AppointmentService.Models;
using AppointmentService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppointmentDbContext _context;

    public AppointmentRepository(AppointmentDbContext context)
    {
        _context = context;
    }

    // ================= CREATE =================
    public async Task<Appointment> AddAsync(Appointment entity)
    {
        _context.Appointments.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    // ================= GET BY ID (FIXED) =================
    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
    }

    // ================= GET ALL (FIXED) =================
    public async Task<List<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Where(x => !x.IsDeleted)
            .ToListAsync();
    }

    // ================= FILTERS (FIXED) =================
    public async Task<List<Appointment>> GetByDoctorIdAsync(int doctorId)
    {
        return await _context.Appointments
            .Where(x => x.DoctorId == doctorId && !x.IsDeleted)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetByPatientIdAsync(int patientId)
    {
        return await _context.Appointments
            .Where(x => x.PatientId == patientId && !x.IsDeleted)
            .ToListAsync();
    }

    public async Task<List<Appointment>> GetByAvailabilityIdAsync(int availabilityId)
    {
        return await _context.Appointments
            .Where(x => x.DoctorAvailabilityId == availabilityId && !x.IsDeleted)
            .ToListAsync();
    }

    // ================= UPDATE =================
    public async Task UpdateAsync(Appointment entity)
    {
        _context.Appointments.Update(entity);
        await _context.SaveChangesAsync();
    }

    // ================= DELETE (HARD DELETE NOT USED) =================
    public async Task DeleteAsync(Appointment entity)
    {
        _context.Appointments.Remove(entity);
        await _context.SaveChangesAsync();
    }
}