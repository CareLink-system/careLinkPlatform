using Microsoft.EntityFrameworkCore;
using PatientService.Data;
using PatientService.Models;
using PatientService.Repositories.Interfaces;

namespace PatientService.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly PatientDbContext _context;

    public PatientRepository(PatientDbContext context)
    {
        _context = context;
    }

    public async Task<Patient> AddAsync(Patient patient)
    {
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        return patient;
    }

    public async Task<IEnumerable<Patient>> GetAllAsync()
    {
        return await _context.Patients.Where(p => !p.IsDeleted).ToListAsync();
    }

    public async Task<Patient?> GetByIdAsync(int id)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
    }

    public async Task<Patient?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted);
    }

    public async Task UpdateAsync(Patient patient)
    {
        _context.Patients.Update(patient);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> SoftDeleteAsync(Patient patient)
    {
        patient.IsDeleted = true;
        patient.DeletedAt = DateTime.UtcNow;
        patient.DeletedBy = "system";
        patient.Status = Enum.CommonStatus.Deleted;

        _context.Patients.Update(patient);
        await _context.SaveChangesAsync();
        return true;
    }
}