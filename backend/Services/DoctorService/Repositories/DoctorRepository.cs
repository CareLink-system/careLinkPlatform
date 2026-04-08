using DoctorService.Data;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoctorService.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly DoctorDbContext _context;

    public DoctorRepository(DoctorDbContext context)
    {
        _context = context;
    }

    public async Task<Doctor> AddAsync(Doctor doctor)
    {
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();
        return doctor;
    }

    public async Task<IEnumerable<Doctor>> GetAllAsync()
    {
        return await _context.Doctors
            .Where(d => !d.IsDeleted)
            .ToListAsync();
    }

    public async Task<Doctor?> GetByIdAsync(int id)
    {
        return await _context.Doctors
            .Include(d => d.AvailabilitySlots)
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
    }

    public async Task<Doctor?> GetByUserIdAsync(int userId)
    {
        return await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == userId && !d.IsDeleted);
    }

    public async Task<IEnumerable<Doctor>> GetVerifiedAsync()
    {
        return await _context.Doctors
            .Where(d => !d.IsDeleted && d.IsVerified)
            .ToListAsync();
    }

    public async Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specializationId)
    {
        return await _context.Doctors
            .Where(d => !d.IsDeleted && d.SpecializationId == specializationId)
            .ToListAsync();
    }

    public async Task UpdateAsync(Doctor doctor)
    {
        _context.Doctors.Update(doctor);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Doctor>> SearchAsync(string? specializationId, string? department, bool? isAvailable, bool? isVerified)
    {
        var query = _context.Doctors.Where(d => !d.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(specializationId))
        {
            query = query.Where(d => d.SpecializationId == specializationId);
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(d => d.Department != null && d.Department == department);
        }

        if (isAvailable.HasValue)
        {
            query = query.Where(d => d.IsAvailable == isAvailable.Value);
        }

        if (isVerified.HasValue)
        {
            query = query.Where(d => d.IsVerified == isVerified.Value);
        }

        return await query.ToListAsync();
    }
}