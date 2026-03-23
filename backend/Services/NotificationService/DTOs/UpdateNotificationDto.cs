namespace NotificationService.DTOs;

public class UpdateNotificationDto
{
    public string Recipient { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Status { get; set; } = default!;
}