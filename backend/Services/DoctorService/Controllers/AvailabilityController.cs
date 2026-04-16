using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
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

    // ================= CREATE =================
    [Authorize(Roles = "Doctor")]
    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] CreateAvailabilitySlotDto dto)
    {
        var result = await _availabilityService.CreateSlotAsync(dto, User.Identity?.Name);

        if (result == null)
            return NotFound(new { message = "Doctor not found" });

        return Ok(result);
    }

    // ================= GET BY DOCTOR =================
    [AllowAnonymous]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetSlotsByDoctor(int doctorId)
    {
        var slots = await _availabilityService.GetSlotsByDoctorIdAsync(doctorId);
        return Ok(slots);
    }

    // ================= GET BY ID =================
    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSlot(int id)
    {
        var slot = await _availabilityService.GetSlotByIdAsync(id);

        if (slot == null)
            return NotFound();

        return Ok(slot);
    }

    // ================= UPDATE =================
    [Authorize(Roles = "Doctor")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateAvailabilitySlotDto dto)
    {
        var updated = await _availabilityService.UpdateSlotAsync(id, dto, User.Identity?.Name);

        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    // ================= DELETE =================
    [Authorize(Roles = "Doctor")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var deleted = await _availabilityService.SoftDeleteSlotAsync(id, User.Identity?.Name);

        if (!deleted)
            return NotFound();

        return Ok(new { message = "Deleted successfully" });
    }
}