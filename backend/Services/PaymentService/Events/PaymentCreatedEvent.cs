using PaymentService.Enum;

namespace PaymentService.Events;

public class PaymentCreatedEvent
{
    public int PaymentId { get; set; }
    public int AppointmentId { get; set; }
    public string PatientId { get; set; } = default!;
    public string DoctorId { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = default!;
    public CommonStatus Status { get; set; } = CommonStatus.Active;
    public DateTime CreatedAt { get; set; }
}
