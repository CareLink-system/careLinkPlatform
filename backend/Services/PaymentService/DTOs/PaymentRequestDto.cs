namespace PaymentService.DTOs;

public class PaymentRequestDto
{
    public int AppointmentId { get; set; }
    public string PatientId { get; set; } = default!;
    public string DoctorId { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "LKR";
    public string PaymentMethod { get; set; } = default!;
    public string PaymentStatus { get; set; } = "Pending";
    public string? TransactionId { get; set; }
    public string? PaymentGateway { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
}
