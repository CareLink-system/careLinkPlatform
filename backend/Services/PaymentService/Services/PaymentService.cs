using MassTransit;
using Microsoft.EntityFrameworkCore.Storage;
using PaymentService.DTOs;
using PaymentService.Events;
using PaymentService.Models;
using PaymentService.Repositories;

namespace PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IPaymentRepository repository, 
        IPublishEndpoint publishEndpoint,
        ILogger<PaymentService> logger)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    // ✅ TRANSACTION HERE - Multiple operations
    public async Task<PaymentResponseDto> CreateAsync(PaymentRequestDto request)
    {
        IDbContextTransaction? transaction = null;
        
        try
        {
            // Start transaction in SERVICE layer
            transaction = await _repository.BeginTransactionAsync();
            
            // 1. Create payment record
            var payment = new Payment
            {
                AppointmentId = request.AppointmentId,
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentMethod = request.PaymentMethod,
                Status = Enum.CommonStatus.Active, // Default to Active on creation
                TransactionId = request.TransactionId,
                PaymentGateway = request.PaymentGateway,
                PaidAt = request.PaidAt,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(payment);
            
            // 2. Publish event (if this fails, everything rolls back)
            await _publishEndpoint.Publish(new PaymentCreatedEvent
            {
                PaymentId = created.Id,
                AppointmentId = created.AppointmentId,
                PatientId = created.PatientId,
                DoctorId = created.DoctorId,
                Amount = created.Amount,
                Currency = created.Currency,
                Status = created.Status,
                CreatedAt = created.CreatedAt
            });
            
            // 3. Commit transaction - ALL operations succeed together
            await transaction.CommitAsync();
            
            _logger.LogInformation("Payment created successfully. Id: {PaymentId}", created.Id);
            return ToDto(created);
        }
        catch (Exception ex)
        {
            // Rollback if anything fails
            if (transaction != null)
            {
                await transaction.RollbackAsync();
            }
            
            _logger.LogError(ex, "Failed to create payment for appointment {AppointmentId}", request.AppointmentId);
            throw;
        }
    }

    // ✅ Simple operation - NO transaction needed
    public async Task<bool> DeleteAsync(int id)
    {
        var result = await _repository.DeleteAsync(id);
        if (result)
        {
            _logger.LogInformation("Payment deleted successfully. Id: {PaymentId}", id);
        }
        return result;
    }

    public async Task<IEnumerable<PaymentResponseDto>> GetAllAsync()
    {
        var payments = await _repository.GetAllAsync();
        return payments.Select(ToDto);
    }

    public async Task<PaymentResponseDto?> GetByIdAsync(int id)
    {
        var payment = await _repository.GetByIdAsync(id);
        return payment == null ? null : ToDto(payment);
    }

    // ✅ Simple update - NO transaction needed (single operation)
    public async Task<PaymentResponseDto> UpdateAsync(int id, PaymentRequestDto request)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) throw new KeyNotFoundException("Payment not found");

        existing.AppointmentId = request.AppointmentId;
        existing.PatientId = request.PatientId;
        existing.DoctorId = request.DoctorId;
        existing.Amount = request.Amount;
        existing.Currency = request.Currency;
        existing.PaymentMethod = request.PaymentMethod;
        existing.Status = request.PaymentStatus;
        existing.TransactionId = request.TransactionId;
        existing.PaymentGateway = request.PaymentGateway;
        existing.PaidAt = request.PaidAt;
        existing.Notes = request.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(existing);
        _logger.LogInformation("Payment updated successfully. Id: {PaymentId}", id);
        return ToDto(updated);
    }

    public async Task<PaginatedResponse<PaymentResponseDto>> GetPaginatedAsync(int page, int pageSize, string? status, DateTime? fromDate, DateTime? toDate, string userId, string userRole)
    {
        var result = await _repository.GetPaginatedAsync(page, pageSize, status, fromDate, toDate, userId, userRole);
        return new PaginatedResponse<PaymentResponseDto>
        {
            Items = result.Items.Select(ToDto),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount
        };
    }

    public async Task<PaymentSummaryDto> GetSummaryAsync(string userId, string userRole)
    {
        return await _repository.GetSummaryAsync(userId, userRole);
    }

    // ✅ EXAMPLE: Complex operation with transaction (Refund)
    public async Task<PaymentResponseDto> RefundPaymentAsync(int paymentId, string reason)
    {
        IDbContextTransaction? transaction = null;
        
        try
        {
            transaction = await _repository.BeginTransactionAsync();
            
            var payment = await _repository.GetByIdAsync(paymentId);
            if (payment == null)
                throw new KeyNotFoundException("Payment not found");
            
            if (payment.Status != Enum.CommonStatus.PaymentCompleted)
                throw new InvalidOperationException("Only completed payments can be refunded");
            
            // 1. Update payment status
            payment.Status = Enum.CommonStatus.RefundPending;
            payment.Notes = $"Refunded: {reason}";
            payment.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(payment);
            
            // 2. Publish refund event
            await _publishEndpoint.Publish(new PaymentRefundedEvent
            {
                PaymentId = payment.Id,
                AppointmentId = payment.AppointmentId,
                Amount = payment.Amount,
                Reason = reason,
                RefundedAt = DateTime.UtcNow
            });
            
            await transaction.CommitAsync();
            _logger.LogInformation("Payment refunded successfully. Id: {PaymentId}", paymentId);
            
            return ToDto(payment);
        }
        catch (Exception ex)
        {
            if (transaction != null)
                await transaction.RollbackAsync();
            
            _logger.LogError(ex, "Failed to refund payment {PaymentId}", paymentId);
            throw;
        }
    }
    // ✅ NEW: Get payment by consultation ID
    public async Task<PaymentResponseDto?> GetByConsultationIdAsync(int? consultationId)
    {
        if (!consultationId.HasValue || consultationId.Value <= 0)
            return null;

        var payment = await _repository.GetByConsultationIdAsync(consultationId.Value);
        return payment == null ? null : ToDto(payment);
    }

    // ✅ NEW: Create pending payment (for Stripe checkout sessions)
    public async Task<PaymentResponseDto> CreatePendingAsync(PaymentRequestDto request)
    {
        IDbContextTransaction? transaction = null;

        try
        {
            transaction = await _repository.BeginTransactionAsync();

            // Check if payment already exists for this consultation
            if (request.ConsultationId.HasValue)
            {
                var existingPayment = await _repository.GetByConsultationIdAsync(request.ConsultationId.Value);
                if (existingPayment != null && existingPayment.Status != Enum.CommonStatus.PaymentFailed)
                {
                    _logger.LogWarning("Payment already exists for consultation {ConsultationId}. Existing payment ID: {PaymentId}",
                        request.ConsultationId, existingPayment.Id);

                    // Return existing payment if it's pending
                    if (existingPayment.Status == Enum.CommonStatus.Active ||
                        existingPayment.Status == Enum.CommonStatus.PaymentPending)
                    {
                        await transaction.CommitAsync();
                        return ToDto(existingPayment);
                    }
                }
            }

            // Create pending payment record
            var payment = new Payment
            {
                AppointmentId = request.AppointmentId,
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentMethod = request.PaymentMethod ?? "stripe",
                Status = Enum.CommonStatus.PaymentPending, // Pending status
                TransactionId = request.TransactionId,
                PaymentGateway = request.PaymentGateway ?? "Stripe",
                PaidAt = null, // Not paid yet
                Notes = request.Notes ?? "Payment initiated via Stripe checkout",
                ConsultationId = request.ConsultationId,
                StripeSessionId = request.StripeSessionId,
                StripePaymentIntentId = request.StripePaymentIntentId,
                Metadata = request.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(payment);

            // Publish pending payment event
            //await _publishEndpoint.Publish(new PaymentPendingEvent
            //{
            //    PaymentId = created.Id,
            //    ConsultationId = created.ConsultationId,
            //    PatientId = created.PatientId,
            //    DoctorId = created.DoctorId,
            //    Amount = created.Amount,
            //    Currency = created.Currency,
            //    StripeSessionId = created.StripeSessionId,
            //    CreatedAt = created.CreatedAt
            //});

            await transaction.CommitAsync();

            _logger.LogInformation("Pending payment created successfully. PaymentId: {PaymentId}, SessionId: {SessionId}",
                created.Id, created.StripeSessionId);

            return ToDto(created);
        }
        catch (Exception ex)
        {
            if (transaction != null)
                await transaction.RollbackAsync();

            _logger.LogError(ex, "Failed to create pending payment for consultation {ConsultationId}", request.ConsultationId);
            throw;
        }
    }

    // ✅ Helper method to update payment after successful Stripe payment
    public async Task<PaymentResponseDto> CompletePaymentAsync(string stripeSessionId, string paymentIntentId)
    {
        IDbContextTransaction? transaction = null;

        try
        {
            transaction = await _repository.BeginTransactionAsync();

            var payment = await _repository.GetByStripeSessionIdAsync(stripeSessionId);
            if (payment == null)
                throw new KeyNotFoundException($"Payment not found for Stripe session: {stripeSessionId}");

            // Update payment status
            payment.Status = Enum.CommonStatus.PaymentCompleted;
            payment.StripePaymentIntentId = paymentIntentId;
            payment.PaidAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            payment.Notes = (payment.Notes ?? "") + " | Payment completed successfully via Stripe";

            var updated = await _repository.UpdateAsync(payment);

            // Publish payment completed event
            await _publishEndpoint.Publish(new PaymentCompletedEvent
            {
                PaymentId = payment.Id,
                ConsultationId = payment.ConsultationId,
                AppointmentId = payment.AppointmentId,
                PatientId = payment.PatientId,
                DoctorId = payment.DoctorId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                StripePaymentIntentId = paymentIntentId,
                PaidAt = payment.PaidAt.Value
            });

            await transaction.CommitAsync();

            _logger.LogInformation("Payment completed successfully. PaymentId: {PaymentId}, SessionId: {SessionId}",
                payment.Id, stripeSessionId);

            return ToDto(updated);
        }
        catch (Exception ex)
        {
            if (transaction != null)
                await transaction.RollbackAsync();

            _logger.LogError(ex, "Failed to complete payment for Stripe session {SessionId}", stripeSessionId);
            throw;
        }
    }


    private static PaymentResponseDto ToDto(Payment p) => new()
    {
        Id = p.Id,
        AppointmentId = p.AppointmentId,
        PatientId = p.PatientId,
        DoctorId = p.DoctorId,
        Amount = p.Amount,
        Currency = p.Currency,
        PaymentMethod = p.PaymentMethod,
        PaymentStatus = p.Status,
        TransactionId = p.TransactionId,
        PaymentGateway = p.PaymentGateway,
        CreatedAt = p.CreatedAt,
        PaidAt = p.PaidAt,
        Notes = p.Notes,
        ConsultationId = p.ConsultationId,
        StripeSessionId = p.StripeSessionId,
        StripePaymentIntentId = p.StripePaymentIntentId
    };
}