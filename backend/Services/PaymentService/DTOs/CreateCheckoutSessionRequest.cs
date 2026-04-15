namespace PaymentService.DTOs
{
    public class CreateCheckoutSessionRequest
    {
        public string ProductName { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string Currency { get; set; } = "usd";
    }
}
