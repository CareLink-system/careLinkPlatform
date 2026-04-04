using PaymentService.DTOs;

namespace PaymentService.Services;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResponseDto>> GetAllAsync();
    Task<PaymentResponseDto?> GetByIdAsync(int id);
    Task<PaymentResponseDto> CreateAsync(PaymentRequestDto request);
    Task<PaymentResponseDto> UpdateAsync(int id, PaymentRequestDto request);
    Task<bool> DeleteAsync(int id);
    Task<PaginatedResponse<PaymentResponseDto>> GetPaginatedAsync(int page, int pageSize, string? status, DateTime? fromDate, DateTime? toDate, string userId, string userRole);
    Task<PaymentSummaryDto> GetSummaryAsync(string userId, string userRole);
}
