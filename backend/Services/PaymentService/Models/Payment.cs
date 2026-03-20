using PaymentService.Enum;
using PaymentService.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace PaymentService.Models;

public class Payment : AuditableEntity
{
    public int Id { get; set; }

    [Required]
    public int PatientId { get; set; }

    [Required]
    public int AppointmentId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = default!;

    [Required]
    public string PaymentStatus { get; set; } = "Pending";

    public string? TransactionId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? Notes { get; set; }

    public string? ReceiptUrl { get; set; }
}
