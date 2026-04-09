using DoctorService.Data;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoctorService.Repositories;

public class PrescriptionRepository : IPrescriptionRepository
{
    private readonly DoctorDbContext _context;

    public PrescriptionRepository(DoctorDbContext context)
    {
        _context = context;
    }

    public async Task<Prescription> AddAsync(Prescription prescription)
    {
        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();
        return prescription;
    }

    public async Task<IEnumerable<Prescription>> GetAllAsync()
    {
        return await _context.Prescriptions
            .Where(p => !p.IsDeleted)
            .ToListAsync();
    }

    public async Task<Prescription?> GetByIdAsync(int id)
    {
        return await _context.Prescriptions
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<IEnumerable<Prescription>> GetByDoctorIdAsync(int doctorId)
    {
        return await _context.Prescriptions
            .Where(p => p.DoctorId == doctorId && !p.IsDeleted)
            .ToListAsync();
    }

    public async Task<IEnumerable<Prescription>> GetByPatientIdAsync(int patientId)
    {
        return await _context.Prescriptions
            .Where(p => p.PatientId == patientId && !p.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(Prescription prescription)
    {
        _context.Prescriptions.Update(prescription);
        await _context.SaveChangesAsync();
    }
}