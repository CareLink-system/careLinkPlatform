namespace PaymentService.Enum;

public enum CommonStatus
{
    Inactive = 0,
    Active = 1,
    Pending = 2,
    Suspended = 3,
    Deleted = 99,

    PaymentCompleted = 10,
    PaymentFailed = 11,
    PaymentPending = 15,
    RefundPending = 20,
    RefundCompleted = 21,
    AppointmentScheduled = 30,
    AppointmentCompleted = 31,
}
