using Microsoft.EntityFrameworkCore.Storage;
using PaymentService.DTOs;
using PaymentService.Models;

namespace PaymentService.Repositories;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment?> GetByIdAsync(int id);
    Task<Payment> AddAsync(Payment payment);
    Task<Payment> UpdateAsync(Payment payment);
    Task<bool> DeleteAsync(int id);
    Task<PaginatedResponse<Payment>> GetPaginatedAsync(int page, int pageSize, string? status, DateTime? fromDate, DateTime? toDate, string userId, string userRole);
    Task<PaymentSummaryDto> GetSummaryAsync(string userId, string userRole);
    
    // ✅ ADD THIS: For transactions in Service layer
    Task<IDbContextTransaction> BeginTransactionAsync();

    // NEW METHODS
    Task<Payment?> GetByConsultationIdAsync(int consultationId);
    Task<Payment?> GetByStripeSessionIdAsync(string stripeSessionId);
    Task<Payment?> GetByStripePaymentIntentIdAsync(string paymentIntentId);
}