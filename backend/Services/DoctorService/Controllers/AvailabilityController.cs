using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] CreateAvailabilitySlotDto dto)
    {
        try
        {
            var result = await _availabilityService.CreateSlotAsync(dto, User.Identity?.Name ?? "system");

            if (result == null)
                return NotFound(new { message = "Doctor not found." });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetSlotsByDoctorId(int doctorId)
    {
        var slots = await _availabilityService.GetSlotsByDoctorIdAsync(doctorId);
        return Ok(slots);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSlotById(int id)
    {
        var slot = await _availabilityService.GetSlotByIdAsync(id);

        if (slot == null)
            return NotFound(new { message = "Availability slot not found." });

        return Ok(slot);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateAvailabilitySlotDto dto)
    {
        try
        {
            var updatedSlot = await _availabilityService.UpdateSlotAsync(id, dto, User.Identity?.Name ?? "system");

            if (updatedSlot == null)
                return NotFound(new { message = "Availability slot not found." });

            return Ok(updatedSlot);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var deleted = await _availabilityService.SoftDeleteSlotAsync(id, User.Identity?.Name ?? "system");

        if (!deleted)
            return NotFound(new { message = "Availability slot not found." });

        return Ok(new { message = "Availability slot deleted successfully." });
    }
}