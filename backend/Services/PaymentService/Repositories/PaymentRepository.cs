using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _db;

    public PaymentRepository(PaymentDbContext db)
    {
        _db = db;
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        payment.CreatedAt = DateTime.UtcNow;
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _db.Payments.FindAsync(id);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.Status = PaymentService.Enum.CommonStatus.Deleted;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _db.Payments
            .Where(p => !p.IsDeleted)
            .ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _db.Payments
            .Where(p => !p.IsDeleted)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment> UpdateAsync(Payment payment)
    {
        var existing = await _db.Payments.FindAsync(payment.Id);
        if (existing == null) throw new KeyNotFoundException("Payment not found");

        existing.AppointmentId = payment.AppointmentId;
        existing.PatientId = payment.PatientId;
        existing.DoctorId = payment.DoctorId;
        existing.Amount = payment.Amount;
        existing.Currency = payment.Currency;
        existing.PaymentMethod = payment.PaymentMethod;
        existing.Status = payment.Status;
        existing.TransactionId = payment.TransactionId;
        existing.PaymentGateway = payment.PaymentGateway;
        existing.PaidAt = payment.PaidAt;
        existing.Notes = payment.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return existing;
    }
}
