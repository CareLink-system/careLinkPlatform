using MassTransit;
using PaymentService.DTOs;
using PaymentService.Events;
using PaymentService.Models;
using PaymentService.Repositories;

namespace PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;

    public PaymentService(IPaymentRepository repository, IPublishEndpoint publishEndpoint)
    {
        _repository = repository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<PaymentResponseDto> CreateAsync(PaymentRequestDto request)
    {
        var payment = new Payment
        {
            AppointmentId = request.AppointmentId,
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            Amount = request.Amount,
            Currency = request.Currency,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = request.PaymentStatus,
            TransactionId = request.TransactionId,
            PaymentGateway = request.PaymentGateway,
            PaidAt = request.PaidAt,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(payment);

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

        return ToDto(created);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
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
        existing.PaymentStatus = request.PaymentStatus;
        existing.TransactionId = request.TransactionId;
        existing.PaymentGateway = request.PaymentGateway;
        existing.PaidAt = request.PaidAt;
        existing.Notes = request.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(existing);
        return ToDto(updated);
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
        PaymentStatus = p.PaymentStatus,
        TransactionId = p.TransactionId,
        PaymentGateway = p.PaymentGateway,
        CreatedAt = p.CreatedAt,
        PaidAt = p.PaidAt,
        Notes = p.Notes
    };
}
