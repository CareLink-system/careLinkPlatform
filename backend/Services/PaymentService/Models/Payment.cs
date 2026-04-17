using PaymentService.Enum;
using PaymentService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace PaymentService.Models;

public class Payment : AuditableEntity
{
    public int Id { get; set; }

    // 🔗 Relationships
    public int AppointmentId { get; set; }
    public string PatientId { get; set; } = default!;
    public string DoctorId { get; set; } = default!;

    // 💰 Payment Info
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "LKR";

    // 💳 Payment Method
    public string PaymentMethod { get; set; } = default!; // Card, Cash, Online

    // 📊 Payment Status
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Completed, Failed, Refunded

    // 🧾 Transaction Details
    public string? TransactionId { get; set; } // from payment gateway
    public string? PaymentGateway { get; set; } // Stripe, PayHere, etc.

    // 🕒 Dates
    public DateTime? PaidAt { get; set; }

    // 📝 Optional
    public string? Notes { get; set; }

    // New fields for consultation and Stripe integration
    public int? ConsultationId { get; set; }
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? Metadata { get; set; }
}

