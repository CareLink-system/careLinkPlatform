using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/v1/doctors/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] CreateAvailabilitySlotDto dto)
    {
        var result = await _availabilityService.CreateSlotAsync(dto, "system");
        if (result == null)
        {
            return NotFound(new { message = "Doctor not found." });
        }

        return Ok(result);
    }

    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetSlotsByDoctorId(int doctorId)
    {
        var slots = await _availabilityService.GetSlotsByDoctorIdAsync(doctorId);
        return Ok(slots);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSlotById(int id)
    {
        var slot = await _availabilityService.GetSlotByIdAsync(id);
        if (slot == null)
        {
            return NotFound(new { message = "Availability slot not found." });
        }

        return Ok(slot);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateAvailabilitySlotDto dto)
    {
        var updatedSlot = await _availabilityService.UpdateSlotAsync(id, dto, "system");
        if (updatedSlot == null)
        {
            return NotFound(new { message = "Availability slot not found." });
        }

        return Ok(updatedSlot);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var deleted = await _availabilityService.SoftDeleteSlotAsync(id, "system");
        if (!deleted)
        {
            return NotFound(new { message = "Availability slot not found." });
        }

        return Ok(new { message = "Availability slot deleted successfully." });
    }
}