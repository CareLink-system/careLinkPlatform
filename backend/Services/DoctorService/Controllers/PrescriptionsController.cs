using DoctorService.DTOs;
using DoctorService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/v1/doctors/prescriptions")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;

    public PrescriptionsController(IPrescriptionService prescriptionService)
    {
        _prescriptionService = prescriptionService;
    }

    [Authorize(Roles = "Doctor,Admin")]
    [HttpPost]
    public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
    {
        var result = await _prescriptionService.CreatePrescriptionAsync(dto, User.Identity?.Name ?? "system");

        if (result == null)
            return NotFound(new { message = "Doctor not found." });

        return CreatedAtAction(nameof(GetPrescriptionById), new { id = result.Id }, result);
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
        var deleted = await _prescriptionService.SoftDeletePrescriptionAsync(id, User.Identity?.Name ?? "system");

        if (!deleted)
            return NotFound(new { message = "Prescription not found." });

        return Ok(new { message = "Prescription deleted successfully." });
    }
}