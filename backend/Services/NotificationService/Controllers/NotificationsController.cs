using Microsoft.AspNetCore.Mvc;
using NotificationService.DTOs;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    [HttpGet]
    public ActionResult<List<NotificationResponseDto>> GetAllNotifications()
    {
        var notifications = new List<NotificationResponseDto>
        {
            new NotificationResponseDto
            {
                Id = 1,
                Recipient = "patient1@example.com",
                Title = "Appointment Confirmed",
                Message = "Your appointment with Dr. Silva has been confirmed.",
                Type = "Email",
                Status = "Sent",
                CreatedAt = DateTime.UtcNow
            },
            new NotificationResponseDto
            {
                Id = 2,
                Recipient = "0771234567",
                Title = "Appointment Reminder",
                Message = "Reminder: Your appointment is tomorrow at 10:00 AM.",
                Type = "SMS",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            }
        };

        return Ok(notifications);
    }

    [HttpGet("{id}")]
    public ActionResult<NotificationResponseDto> GetNotificationById(int id)
    {
        if (id != 1)
        {
            return NotFound(new { message = $"Notification with id {id} not found" });
        }

        var notification = new NotificationResponseDto
        {
            Id = 1,
            Recipient = "patient1@example.com",
            Title = "Appointment Confirmed",
            Message = "Your appointment with Dr. Silva has been confirmed.",
            Type = "Email",
            Status = "Sent",
            CreatedAt = DateTime.UtcNow
        };

        return Ok(notification);
    }

    [HttpPost]
    public ActionResult<NotificationResponseDto> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        var createdNotification = new NotificationResponseDto
        {
            Id = 3,
            Recipient = dto.Recipient,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        return CreatedAtAction(nameof(GetNotificationById), new { id = createdNotification.Id }, createdNotification);
    }

    [HttpPut("{id}")]
    public ActionResult<NotificationResponseDto> UpdateNotification(int id, [FromBody] UpdateNotificationDto dto)
    {
        var updatedNotification = new NotificationResponseDto
        {
            Id = id,
            Recipient = dto.Recipient,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow
        };

        return Ok(updatedNotification);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteNotification(int id)
    {
        return Ok(new { message = $"Notification with id {id} deleted successfully" });
    }
}