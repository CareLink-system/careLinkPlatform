using PaymentService.Enum;

namespace PaymentService.Events
{
    public class PaymentCreatedEvent
    {
        public int PaymentId { get; set; }
        public int AppointmentId { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public CommonStatus Status { get; set; } 
        public DateTime CreatedAt { get; set; }
    }

    public class PaymentPendingEvent
    {
        public int PaymentId { get; set; }
        public int? ConsultationId { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? StripeSessionId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PaymentCompletedEvent
    {
        public int PaymentId { get; set; }
        public int? ConsultationId { get; set; }
        public int AppointmentId { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string? StripePaymentIntentId { get; set; }
        public DateTime PaidAt { get; set; }
    }

    // Make sure PaymentCreatedEvent and PaymentRefundedEvent exist
    
    public class PaymentRefundedEvent
    {
        public int PaymentId { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime RefundedAt { get; set; }
    }

}
