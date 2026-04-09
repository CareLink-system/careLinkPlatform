using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatientService.DTOs;
using PatientService.Services.Interfaces;

namespace PatientService.Controllers
{
    [ApiController]
    [Route("api/v1/patients/medical-reports")]
    public class MedicalReportsController : ControllerBase
    {
        private readonly IMedicalReportService _service;

        public MedicalReportsController(IMedicalReportService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMedicalReportDto dto)
        {
            var result = await _service.CreateMedicalReportAsync(dto, User.Identity?.Name ?? "system");
            return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _service.GetAllMedicalReportsAsync();
            return Ok(reports);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _service.GetMedicalReportByIdAsync(id);
            if (report == null) return NotFound(new { message = "Medical report not found." });
            return Ok(report);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetByPatientId(int patientId)
        {
            var reports = await _service.GetByPatientIdAsync(patientId);
            return Ok(reports);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpGet("doctor/{doctorId:int}")]
        public async Task<IActionResult> GetByDoctorId(int doctorId)
        {
            var reports = await _service.GetByDoctorIdAsync(doctorId);
            return Ok(reports);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpGet("appointment/{appointmentId:int}")]
        public async Task<IActionResult> GetByAppointmentId(int appointmentId)
        {
            var reports = await _service.GetByAppointmentIdAsync(appointmentId);
            return Ok(reports);
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMedicalReportDto dto)
        {
            var updated = await _service.UpdateMedicalReportAsync(id, dto, User.Identity?.Name ?? "system");
            if (!updated) return NotFound(new { message = "Medical report not found." });
            return Ok(new { message = "Medical report updated successfully." });
        }

        [Authorize(Roles = "Doctor,Admin,Patient")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.SoftDeleteMedicalReportAsync(id, User.Identity?.Name ?? "system");
            if (!deleted) return NotFound(new { message = "Medical report not found." });
            return Ok(new { message = "Medical report deleted successfully." });
        }
    }
}