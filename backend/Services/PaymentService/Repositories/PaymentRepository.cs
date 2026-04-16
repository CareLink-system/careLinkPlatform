using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.DTOs;
using PaymentService.Models;
using Microsoft.EntityFrameworkCore.Storage;
namespace PaymentService.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _db;

    public PaymentRepository(PaymentDbContext db)
    {
        _db = db;
    }

    // ✅ REMOVED transaction - Repository only does CRUD
    public async Task<Payment> AddAsync(Payment payment)
    {
        payment.CreatedAt = DateTime.UtcNow;
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    // ✅ REMOVED transaction - Simple delete operation
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

    // ✅ REMOVED transaction - Simple update
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

    public async Task<PaginatedResponse<Payment>> GetPaginatedAsync(int page, int pageSize, string? status, DateTime? fromDate, DateTime? toDate, string userId, string userRole)
    {
        try
        {
            var query = _db.Payments.Where(p => !p.IsDeleted);

            // Apply authorization filters
            if (userRole != "Admin")
            {
                if (userRole == "Patient")
                {
                    query = query.Where(p => p.PatientId == userId);
                }
                else if (userRole == "Doctor")
                {
                    query = query.Where(p => p.DoctorId == userId);
                }
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status.ToString() == status);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt <= toDate.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResponse<Payment>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
        catch(Exception ex)
        {
            throw new KeyNotFoundException(ex.Message);
        }
    }

    public async Task<PaymentSummaryDto> GetSummaryAsync(string userId, string userRole)
    {
        var query = _db.Payments.Where(p => !p.IsDeleted);

        // Apply authorization filters
        if (userRole != "Admin")
        {
            if (userRole == "Patient")
            {
                query = query.Where(p => p.PatientId == userId);
            }
            else if (userRole == "Doctor")
            {
                query = query.Where(p => p.DoctorId == userId);
            }
        }

        var payments = await query.ToListAsync();

        var totalAmount = payments.Sum(p => p.Amount);
        var totalCount = payments.Count;
        var averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

        var amountByStatus = payments
            .GroupBy(p => p.Status.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));

        var countByStatus = payments
            .GroupBy(p => p.Status.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var thisMonth = DateTime.UtcNow.AddMonths(-1);
        var thisMonthPayments = payments.Where(p => p.CreatedAt >= thisMonth).ToList();
        var thisMonthTotal = thisMonthPayments.Sum(p => p.Amount);
        var thisMonthCount = thisMonthPayments.Count;

        return new PaymentSummaryDto
        {
            TotalAmount = totalAmount,
            TotalCount = totalCount,
            AverageAmount = averageAmount,
            AmountByStatus = amountByStatus,
            CountByStatus = countByStatus,
            ThisMonthTotal = thisMonthTotal,
            ThisMonthCount = thisMonthCount
        };
    }
    
    // ✅ ADD THIS: Method to get DbContext for transactions in Service layer
    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        return await _db.Database.BeginTransactionAsync();
    }

    // ✅ NEW: Get payment by consultation ID
    public async Task<Payment?> GetByConsultationIdAsync(int consultationId)
    {
        return await _db.Payments
            .Where(p => !p.IsDeleted && p.ConsultationId == consultationId)
            .FirstOrDefaultAsync();
    }

    // ✅ NEW: Get payment by Stripe session ID
    public async Task<Payment?> GetByStripeSessionIdAsync(string stripeSessionId)
    {
        if (string.IsNullOrWhiteSpace(stripeSessionId))
            return null;

        return await _db.Payments
            .Where(p => !p.IsDeleted && p.StripeSessionId == stripeSessionId)
            .FirstOrDefaultAsync();
    }

    // ✅ NEW: Get payment by Stripe payment intent ID
    public async Task<Payment?> GetByStripePaymentIntentIdAsync(string paymentIntentId)
    {
        if (string.IsNullOrWhiteSpace(paymentIntentId))
            return null;

        return await _db.Payments
            .Where(p => !p.IsDeleted && p.StripePaymentIntentId == paymentIntentId)
            .FirstOrDefaultAsync();
    }

}