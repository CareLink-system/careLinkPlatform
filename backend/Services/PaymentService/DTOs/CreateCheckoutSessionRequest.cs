using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace PaymentService.DTOs
{
    //public class CreateCheckoutSessionRequest
    //{
    //    public string ProductName { get; set; } = string.Empty;
    //    public long Amount { get; set; }
    //    public string Currency { get; set; } = "usd";
    //}

    public class CreateCheckoutSessionRequest
    {
        /// <summary>
        /// Payment amount in cents/smallest currency unit (e.g., $50.00 = 5000)
        /// </summary>
        [Required]
        public long Amount { get; set; }

        /// <summary>
        /// Currency code - Only USD and LKR are supported
        /// </summary>
        [Required]
        [RegularExpression("^(USD|LKR|usd|lkr)$", ErrorMessage = "Currency must be either USD or LKR")]
        public string Currency { get; set; } = "USD";

        /// <summary>
        /// Patient ID who is making the payment
        /// </summary>
        [Required]
        public string PatientId { get; set; }

        [Required]
        public int AppointmentId { get; set; }

        /// <summary>
        /// Doctor ID receiving the payment
        /// </summary>
        [Required]
        public string DoctorId { get; set; }

        /// <summary>
        /// Doctor name for display purposes
        /// </summary>
        public string DoctorName { get; set; }

        /// <summary>
        /// Consultation ID (optional)
        /// </summary>
        public int? ConsultationId { get; set; }

        /// <summary>
        /// Success URL after payment
        /// </summary>
        [Required]
        [Url]
        public string SuccessUrl { get; set; }

        /// <summary>
        /// Cancel URL if payment is cancelled
        /// </summary>
        [Required]
        [Url]
        public string CancelUrl { get; set; }

        /// <summary>
        /// Product name for display
        /// </summary>
        public string ProductName { get; set; }

        /// <summary>
        /// Product description for display
        /// </summary>
        public string ProductDescription { get; set; }

        /// <summary>
        /// Product images for display
        /// </summary>
        public List<string> ProductImages { get; set; }

        /// <summary>
        /// Customer email (optional, will use logged-in user if not provided)
        /// </summary>
        [EmailAddress]
        public string CustomerEmail { get; set; }

        /// <summary>
        /// Locale for checkout page (e.g., 'en', 'es', 'fr')
        /// </summary>
        public string Locale { get; set; }

        /// <summary>
        /// Additional metadata for tracking
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; }
    }

    public class CheckoutSessionResponse
    {
        public string SessionId { get; set; }
        public string Url { get; set; }
        public int? PaymentId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public long Amount { get; set; }
        public string Currency {  get; set; }
        public int? ConsultationId { get; set; }
    }
}
