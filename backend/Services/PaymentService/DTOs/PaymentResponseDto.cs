using PaymentService.Enum;

namespace PaymentService.DTOs;

public class PaymentResponseDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string PatientId { get; set; } = default!;
    public string DoctorId { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "LKR";
    public string PaymentMethod { get; set; } = default!;
    public CommonStatus PaymentStatus { get; set; } = CommonStatus.Active;
    public string? TransactionId { get; set; }
    public string? PaymentGateway { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    // New fields
    public int? ConsultationId { get; set; }
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
}

public class PaginatedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}

public class ApiErrorResponse
{
    public int Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ValidationErrorResponse : ApiErrorResponse
{
    public List<ValidationError> Errors { get; set; } = new();
}

public class PaymentSummaryDto
{
    public decimal TotalAmount { get; set; }
    public int TotalCount { get; set; }
    public decimal AverageAmount { get; set; }
    public Dictionary<string, decimal> AmountByStatus { get; set; } = new();
    public Dictionary<string, int> CountByStatus { get; set; } = new();
    public decimal ThisMonthTotal { get; set; }
    public int ThisMonthCount { get; set; }
}