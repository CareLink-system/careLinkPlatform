using AppointmentService.DTOs;
using AppointmentService.Models.Enums;
using AppointmentService.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service)
    {
        _service = service;
    }

    // ================= CREATE =================
    [HttpPost]
    public async Task<IActionResult> Create(CreateAppointmentDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // ================= READ =================
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetByDoctor(int doctorId)
        => Ok(await _service.GetByDoctorIdAsync(doctorId));

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(int patientId)
        => Ok(await _service.GetByPatientIdAsync(patientId));

    // ================= UPDATE =================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAppointmentDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success) return NotFound();

        var updated = await _service.GetByIdAsync(id);
        return Ok(updated);
    }

    // ================= CANCEL (SOFT ACTION) =================
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var success = await _service.CancelAsync(id);
        if (!success) return NotFound();

        return NoContent();
    }

    // ================= SOFT DELETE =================
    [HttpDelete("soft/{id}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        var success = await _service.SoftDeleteAsync(id);
        if (!success) return NotFound();

        return NoContent();
    }

    // ================= STATUS UPDATE (DOCTOR/ADMIN ONLY) =================
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusDto dto)
    {
        var success = await _service.UpdateStatusAsync(id, dto.AppointmentStatus);
        if (!success) return NotFound();

        return NoContent();
    }
}