
using PaymentService.Enum;
namespace PaymentService.DTOs;

public class PaymentRequestDto
{
    public int AppointmentId { get; set; }
    public string PatientId { get; set; } = default!;
    public string DoctorId { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "LKR";
    public string PaymentMethod { get; set; } = default!;
    public CommonStatus PaymentStatus { get; set; } = CommonStatus.Active;
    public string? TransactionId { get; set; }
    public string? PaymentGateway { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }


    // New fields for consultation and Stripe integration
    public int? ConsultationId { get; set; }
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? Metadata { get; set; }
}
