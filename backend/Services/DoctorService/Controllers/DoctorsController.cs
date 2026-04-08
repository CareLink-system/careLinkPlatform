using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        var result = await _doctorService.CreateDoctorAsync(dto, "system");
        return CreatedAtAction(nameof(GetDoctorById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDoctors()
    {
        var doctors = await _doctorService.GetAllDoctorsAsync();
        return Ok(doctors);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDoctorById(int id)
    {
        var doctor = await _doctorService.GetDoctorByIdAsync(id);
        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found." });
        }

        return Ok(doctor);
    }

    [HttpGet("verified")]
    public async Task<IActionResult> GetVerifiedDoctors()
    {
        var doctors = await _doctorService.GetVerifiedDoctorsAsync();
        return Ok(doctors);
    }

    [HttpGet("specialization/{specializationId}")]
    public async Task<IActionResult> GetDoctorsBySpecialization(string specializationId)
    {
        var doctors = await _doctorService.GetDoctorsBySpecializationAsync(specializationId);
        return Ok(doctors);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
    {
        var updatedDoctor = await _doctorService.UpdateDoctorAsync(id, dto, "system");
        if (updatedDoctor == null)
        {
            return NotFound(new { message = "Doctor not found." });
        }

        return Ok(updatedDoctor);
    }

    [HttpPut("{id:int}/verify")]
    public async Task<IActionResult> VerifyDoctor(int id)
    {
        var verifiedDoctor = await _doctorService.VerifyDoctorAsync(id, "admin");
        if (verifiedDoctor == null)
        {
            return NotFound(new { message = "Doctor not found." });
        }

        return Ok(verifiedDoctor);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var deleted = await _doctorService.SoftDeleteDoctorAsync(id, "system");
        if (!deleted)
        {
            return NotFound(new { message = "Doctor not found." });
        }

        return Ok(new { message = "Doctor deleted successfully." });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchDoctors([FromQuery] DoctorSearchDto searchDto)
    {
        var doctors = await _doctorService.SearchDoctorsAsync(searchDto);
        return Ok(doctors);
    }
}