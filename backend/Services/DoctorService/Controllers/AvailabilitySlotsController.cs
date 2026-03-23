using DoctorService.Data;
using DoctorService.DTOs;
using DoctorService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilitySlotsController : ControllerBase
{
    private readonly DoctorDbContext _context;

    public AvailabilitySlotsController(DoctorDbContext context)
    {
        _context = context;
    }

    [HttpGet("doctor/{doctorId}")]
    public async Task<ActionResult<IEnumerable<AvailabilitySlotResponseDto>>> GetSlotsByDoctorId(int doctorId)
    {
        var slots = await _context.AvailabilitySlots
            .Where(s => s.DoctorId == doctorId)
            .Select(s => new AvailabilitySlotResponseDto
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                SlotDate = s.SlotDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsBooked = s.IsBooked,
                AppointmentId = s.AppointmentId,
                DayOfWeek = s.DayOfWeek,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(slots);
    }

    [HttpPost]
    public async Task<ActionResult<AvailabilitySlotResponseDto>> CreateAvailabilitySlot([FromBody] CreateAvailabilitySlotDto dto)
    {
        var slot = new AvailabilitySlot
        {
            DoctorId = dto.DoctorId,
            SlotDate = dto.SlotDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            DayOfWeek = dto.DayOfWeek,
            IsBooked = false,
            AppointmentId = null,
            CreatedAt = DateTime.UtcNow
        };

        _context.AvailabilitySlots.Add(slot);
        await _context.SaveChangesAsync();

        var response = new AvailabilitySlotResponseDto
        {
            Id = slot.Id,
            DoctorId = slot.DoctorId,
            SlotDate = slot.SlotDate,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsBooked = slot.IsBooked,
            AppointmentId = slot.AppointmentId,
            DayOfWeek = slot.DayOfWeek,
            CreatedAt = slot.CreatedAt,
            UpdatedAt = slot.UpdatedAt
        };

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AvailabilitySlotResponseDto>> UpdateAvailabilitySlot(int id, [FromBody] UpdateAvailabilitySlotDto dto)
    {
        var slot = await _context.AvailabilitySlots.FindAsync(id);

        if (slot == null)
        {
            return NotFound(new { message = $"Availability slot with id {id} not found" });
        }

        slot.SlotDate = dto.SlotDate;
        slot.StartTime = dto.StartTime;
        slot.EndTime = dto.EndTime;
        slot.DayOfWeek = dto.DayOfWeek;
        slot.IsBooked = dto.IsBooked;
        slot.AppointmentId = dto.AppointmentId;
        slot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new AvailabilitySlotResponseDto
        {
            Id = slot.Id,
            DoctorId = slot.DoctorId,
            SlotDate = slot.SlotDate,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsBooked = slot.IsBooked,
            AppointmentId = slot.AppointmentId,
            DayOfWeek = slot.DayOfWeek,
            CreatedAt = slot.CreatedAt,
            UpdatedAt = slot.UpdatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAvailabilitySlot(int id)
    {
        var slot = await _context.AvailabilitySlots.FindAsync(id);

        if (slot == null)
        {
            return NotFound(new { message = $"Availability slot with id {id} not found" });
        }

        _context.AvailabilitySlots.Remove(slot);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Availability slot with id {id} deleted successfully" });
    }
}