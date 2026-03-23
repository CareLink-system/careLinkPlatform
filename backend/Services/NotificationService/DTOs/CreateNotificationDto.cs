namespace NotificationService.DTOs;

public class CreateNotificationDto
{
    public string Recipient { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = default!; // Email, SMS, InApp
    public string Status { get; set; } = "Pending"; // Pending, Sent, Failed
}