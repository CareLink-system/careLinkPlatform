using Microsoft.AspNetCore.Mvc;
using PatientService.DTOs;
using PatientService.Services.Interfaces;

namespace PatientService.Controllers;

[ApiController]
[Route("api/v1/patients")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _service;

    public PatientsController(IPatientService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDto dto)
    {
        var patient = await _service.CreatePatientAsync(dto, User.Identity?.Name ?? "system");
        return CreatedAtAction(nameof(GetPatientById), new { id = patient.Id }, patient);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPatients()
    {
        var patients = await _service.GetAllPatientsAsync();
        return Ok(patients);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPatientById(int id)
    {
        var patient = await _service.GetPatientByIdAsync(id);
        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        return Ok(patient);
    }

    // GET api/v1/patients/user/{userId}
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetPatientByUserId(Guid userId)
    {
        var patient = await _service.GetPatientByUserIdAsync(userId);
        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        return Ok(patient);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto dto)
    {
        var updated = await _service.UpdatePatientAsync(id, dto, User.Identity?.Name ?? "system");
        if (updated == null)
            return NotFound(new { message = "Patient not found." });

        return Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var deleted = await _service.SoftDeletePatientAsync(id);
        if (!deleted)
            return NotFound(new { message = "Patient not found." });

        return Ok(new { message = "Patient deleted successfully." });
    }
}