using DoctorService.Data;
using DoctorService.Models;
using DoctorService.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoctorService.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly DoctorDbContext _context;

    public AvailabilityRepository(DoctorDbContext context)
    {
        _context = context;
    }

    public async Task<AvailabilitySlot> AddAsync(AvailabilitySlot slot)
    {
        _context.AvailabilitySlots.Add(slot);
        await _context.SaveChangesAsync();
        return slot;
    }

    public async Task<AvailabilitySlot?> GetByIdAsync(int id)
    {
        return await _context.AvailabilitySlots
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
    }

    public async Task<IEnumerable<AvailabilitySlot>> GetByDoctorIdAsync(int doctorId)
    {
        return await _context.AvailabilitySlots
            .Where(a => a.DoctorId == doctorId && !a.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(AvailabilitySlot slot)
    {
        _context.AvailabilitySlots.Update(slot);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(AvailabilitySlot slot)
    {
        _context.AvailabilitySlots.Update(slot);
        await _context.SaveChangesAsync();
    }
}