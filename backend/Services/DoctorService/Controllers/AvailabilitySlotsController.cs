using DoctorService.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilitySlotsController : ControllerBase
{
    [HttpGet("doctor/{doctorId}")]
    public ActionResult<List<AvailabilitySlotResponseDto>> GetSlotsByDoctorId(int doctorId)
    {
        var slots = new List<AvailabilitySlotResponseDto>
        {
            new AvailabilitySlotResponseDto
            {
                Id = 1,
                DoctorId = doctorId,
                SlotDate = DateTime.Today.AddDays(1),
                StartTime = "09:00 AM",
                EndTime = "10:00 AM",
                IsBooked = false,
                AppointmentId = null,
                DayOfWeek = DateTime.Today.AddDays(1).DayOfWeek.ToString(),
                CreatedAt = DateTime.UtcNow
            },
            new AvailabilitySlotResponseDto
            {
                Id = 2,
                DoctorId = doctorId,
                SlotDate = DateTime.Today.AddDays(1),
                StartTime = "10:00 AM",
                EndTime = "11:00 AM",
                IsBooked = true,
                AppointmentId = 501,
                DayOfWeek = DateTime.Today.AddDays(1).DayOfWeek.ToString(),
                CreatedAt = DateTime.UtcNow
            }
        };

        return Ok(slots);
    }

    [HttpPost]
    public ActionResult<AvailabilitySlotResponseDto> CreateAvailabilitySlot([FromBody] CreateAvailabilitySlotDto dto)
    {
        var createdSlot = new AvailabilitySlotResponseDto
        {
            Id = 3,
            DoctorId = dto.DoctorId,
            SlotDate = dto.SlotDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsBooked = false,
            AppointmentId = null,
            DayOfWeek = dto.DayOfWeek,
            CreatedAt = DateTime.UtcNow
        };

        return Ok(createdSlot);
    }

    [HttpPut("{id}")]
    public ActionResult<AvailabilitySlotResponseDto> UpdateAvailabilitySlot(int id, [FromBody] UpdateAvailabilitySlotDto dto)
    {
        var updatedSlot = new AvailabilitySlotResponseDto
        {
            Id = id,
            DoctorId = 1,
            SlotDate = dto.SlotDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsBooked = dto.IsBooked,
            AppointmentId = dto.AppointmentId,
            DayOfWeek = dto.DayOfWeek,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow
        };

        return Ok(updatedSlot);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteAvailabilitySlot(int id)
    {
        return Ok(new { message = $"Availability slot with id {id} deleted successfully" });
    }
}