using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/v1/doctors/prescriptions")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(ClaimTypes.Name)
        ?? User.Identity?.Name;

    public PrescriptionsController(IPrescriptionService prescriptionService)
    {
        _prescriptionService = prescriptionService;
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
    {
        var result = await _prescriptionService.CreatePrescriptionAsync(dto, CurrentUserId ?? "system");

        if (result == null)
            return NotFound(new { message = "Doctor not found." });

        return CreatedAtAction(nameof(GetPrescriptionById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePrescription(int id, [FromBody] UpdatePrescriptionDto dto)
    {
        try
        {
            var result = await _prescriptionService.UpdatePrescriptionAsync(
                id,
                dto,
                CurrentUserId ?? "system",
                CurrentUserId,
                User.IsInRole("Admin"));

            if (result == null)
                return NotFound(new { message = "Prescription not found." });

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
    }

    [Authorize(Roles = "Doctor,Admin,Patient")]
    [HttpGet]
    public async Task<IActionResult> GetAllPrescriptions()
    {
        var prescriptions = await _prescriptionService.GetAllPrescriptionsAsync();
        return Ok(prescriptions);
    }

    [Authorize(Roles = "Doctor,Admin,Patient")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPrescriptionById(int id)
    {
        var prescription = await _prescriptionService.GetPrescriptionByIdAsync(id);

        if (prescription == null)
            return NotFound(new { message = "Prescription not found." });

        return Ok(prescription);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetPrescriptionsByDoctorId(int doctorId)
    {
        var prescriptions = await _prescriptionService.GetPrescriptionsByDoctorIdAsync(doctorId);
        return Ok(prescriptions);
    }

    [Authorize(Roles = "Doctor,Admin,Patient")]
    [HttpGet("patient/{patientId:int}")]
    public async Task<IActionResult> GetPrescriptionsByPatientId(int patientId)
    {
        var prescriptions = await _prescriptionService.GetPrescriptionsByPatientIdAsync(patientId);
        return Ok(prescriptions);
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePrescription(int id)
    {
        try
        {
            var deleted = await _prescriptionService.SoftDeletePrescriptionAsync(
                id,
                CurrentUserId ?? "system",
                CurrentUserId,
                User.IsInRole("Admin"));

            if (!deleted)
                return NotFound(new { message = "Prescription not found." });

            return Ok(new { message = "Prescription deleted successfully." });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}