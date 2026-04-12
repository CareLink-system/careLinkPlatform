using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/v1/doctors")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        var result = await _doctorService.CreateDoctorAsync(dto, User.Identity?.Name ?? "system");
        return CreatedAtAction(nameof(GetDoctorById), new { id = result.Id }, result);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllDoctors()
    {
        var doctors = await _doctorService.GetAllDoctorsAsync();
        return Ok(doctors);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDoctorById(int id)
    {
        var doctor = await _doctorService.GetDoctorByIdAsync(id);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        return Ok(doctor);
    }

    [AllowAnonymous]
    [HttpGet("verified")]
    public async Task<IActionResult> GetVerifiedDoctors()
    {
        var doctors = await _doctorService.GetVerifiedDoctorsAsync();
        return Ok(doctors);
    }

    [AllowAnonymous]
    [HttpGet("specialization/{specializationId}")]
    public async Task<IActionResult> GetDoctorsBySpecialization(string specializationId)
    {
        var doctors = await _doctorService.GetDoctorsBySpecializationAsync(specializationId);
        return Ok(doctors);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
    {
        var updatedDoctor = await _doctorService.UpdateDoctorAsync(id, dto, User.Identity?.Name ?? "system");

        if (updatedDoctor == null)
            return NotFound(new { message = "Doctor not found." });

        return Ok(updatedDoctor);
    }

    [Authorize(Roles = "Admin , Doctor")]
    [HttpPut("{id:int}/verify")]
    public async Task<IActionResult> VerifyDoctor(int id)
    {
        var verifiedDoctor = await _doctorService.VerifyDoctorAsync(id, User.Identity?.Name ?? "admin");

        if (verifiedDoctor == null)
            return NotFound(new { message = "Doctor not found." });

        return Ok(verifiedDoctor);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var deleted = await _doctorService.SoftDeleteDoctorAsync(id, User.Identity?.Name ?? "system");

        if (!deleted)
            return NotFound(new { message = "Doctor not found." });

        return Ok(new { message = "Doctor deleted successfully." });
    }

    [AllowAnonymous]
    [HttpGet("search")]
    public async Task<IActionResult> SearchDoctors([FromQuery] DoctorSearchDto searchDto)
    {
        var doctors = await _doctorService.SearchDoctorsAsync(searchDto);
        return Ok(doctors);
    }

    [Authorize(Roles = "Doctor")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.Identity?.Name;
        var doctor = await _doctorService.GetDoctorByUserIdAsync(userId);
        if (doctor == null) return NotFound();
        return Ok(doctor);
    }
}