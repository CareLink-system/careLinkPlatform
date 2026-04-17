using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using NotificationService.Models;
using NotificationService.Services;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly IMongoCollection<NotificationRecord> _records;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(
        IMongoCollection<NotificationRecord> records,
        IEmailService emailService,
        ISmsService smsService,
        ILogger<NotificationController> logger)
    {
        _records = records;
        _emailService = emailService;
        _smsService = smsService;
        _logger = logger;
    }

    [HttpPost("appointment-booked")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AppointmentBooked(
        [FromBody] AppointmentNotificationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AppointmentId))
        {
            return BadRequest(new { message = "AppointmentId is required." });
        }

        var correlationId = Guid.NewGuid().ToString("N");
        var subject = "Appointment Booking Confirmation";
        var patientMessage = $"Hello {request.PatientName}, your appointment (ID: {request.AppointmentId}) is confirmed for {request.AppointmentTime:yyyy-MM-dd HH:mm}.";
        var doctorMessage = $"Hello Dr. {request.DoctorName}, appointment (ID: {request.AppointmentId}) is booked for {request.AppointmentTime:yyyy-MM-dd HH:mm}.";

        var records = BuildRecords(request, patientMessage, doctorMessage);
        if (records.Count == 0)
        {
            return BadRequest(new { message = "At least one recipient contact (email or phone) is required." });
        }

        await _records.InsertManyAsync(records, cancellationToken: cancellationToken);

        foreach (var record in records)
        {
            try
            {
                if (record.Channel == "email")
                {
                    await _emailService.SendAsync(record.Recipient, subject, record.Message, cancellationToken);
                }
                else if (record.Channel == "sms")
                {
                    await _smsService.SendAsync(record.Recipient, record.Message, cancellationToken);
                }

                await UpdateStatus(record.Id, "Sent", cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send {Channel} notification to {Recipient}", record.Channel, record.Recipient);
                await UpdateStatus(record.Id, "Failed", cancellationToken);
            }
        }

        _logger.LogInformation("Notification request accepted. CorrelationId={CorrelationId}, AppointmentId={AppointmentId}", correlationId, request.AppointmentId);

        return Accepted(new
        {
            message = "Notification request accepted for processing.",
            correlationId,
            appointmentId = request.AppointmentId,
            loggedRecords = records.Count
        });
    }

    private static List<NotificationRecord> BuildRecords(
        AppointmentNotificationRequest request,
        string patientMessage,
        string doctorMessage)
    {
        var records = new List<NotificationRecord>();

        AddIfPresent(records, request.PatientEmail, patientMessage, "appointment_confirmation", "email", request.AppointmentId);
        AddIfPresent(records, request.PatientPhone, patientMessage, "appointment_confirmation", "sms", request.AppointmentId);
        AddIfPresent(records, request.DoctorEmail, doctorMessage, "appointment_confirmation", "email", request.AppointmentId);
        AddIfPresent(records, request.DoctorPhone, doctorMessage, "appointment_confirmation", "sms", request.AppointmentId);

        return records;
    }

    private static void AddIfPresent(
        ICollection<NotificationRecord> records,
        string recipient,
        string message,
        string type,
        string channel,
        string appointmentId)
    {
        if (string.IsNullOrWhiteSpace(recipient))
        {
            return;
        }

        records.Add(new NotificationRecord
        {
            Recipient = recipient,
            Message = message,
            Type = type,
            Channel = channel,
            AppointmentId = appointmentId,
            Timestamp = DateTime.UtcNow,
            Status = "Pending"
        });
    }

    private async Task UpdateStatus(string? id, string status, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return;
        }

        var filter = Builders<NotificationRecord>.Filter.Eq(r => r.Id, id);
        var update = Builders<NotificationRecord>.Update.Set(r => r.Status, status);
        await _records.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }
}
