using DoctorService.Data;
using DoctorService.DTOs;
using DoctorService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly DoctorDbContext _context;

    public DoctorsController(DoctorDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DoctorResponseDto>>> GetAllDoctors()
    {
        var doctors = await _context.Doctors
            .Select(d => new DoctorResponseDto
            {
                Id = d.Id,
                UserId = d.UserId,
                SpecializationId = d.SpecializationId,
                LicenseNumber = d.LicenseNumber,
                Qualifications = d.Qualifications,
                Experience = d.Experience,
                Bio = d.Bio,
                Rating = d.Rating,
                IsAvailable = d.IsAvailable,
                Department = d.Department,
                ConsultationFee = d.ConsultationFee,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            })
            .ToListAsync();

        return Ok(doctors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DoctorResponseDto>> GetDoctorById(int id)
    {
        var d = await _context.Doctors.FindAsync(id);

        if (d == null)
        {
            return NotFound(new { message = $"Doctor with id {id} not found" });
        }

        var doctor = new DoctorResponseDto
        {
            Id = d.Id,
            UserId = d.UserId,
            SpecializationId = d.SpecializationId,
            LicenseNumber = d.LicenseNumber,
            Qualifications = d.Qualifications,
            Experience = d.Experience,
            Bio = d.Bio,
            Rating = d.Rating,
            IsAvailable = d.IsAvailable,
            Department = d.Department,
            ConsultationFee = d.ConsultationFee,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };

        return Ok(doctor);
    }

    [HttpPost]
    public async Task<ActionResult<DoctorResponseDto>> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        var doctor = new Doctor
        {
            UserId = dto.UserId,
            SpecializationId = dto.SpecializationId,
            LicenseNumber = dto.LicenseNumber,
            Qualifications = dto.Qualifications,
            Experience = dto.Experience,
            Bio = dto.Bio,
            IsAvailable = dto.IsAvailable,
            Department = dto.Department,
            ConsultationFee = dto.ConsultationFee,
            Rating = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        var response = new DoctorResponseDto
        {
            Id = doctor.Id,
            UserId = doctor.UserId,
            SpecializationId = doctor.SpecializationId,
            LicenseNumber = doctor.LicenseNumber,
            Qualifications = doctor.Qualifications,
            Experience = doctor.Experience,
            Bio = doctor.Bio,
            Rating = doctor.Rating,
            IsAvailable = doctor.IsAvailable,
            Department = doctor.Department,
            ConsultationFee = doctor.ConsultationFee,
            CreatedAt = doctor.CreatedAt,
            UpdatedAt = doctor.UpdatedAt
        };

        return CreatedAtAction(nameof(GetDoctorById), new { id = doctor.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DoctorResponseDto>> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
        {
            return NotFound(new { message = $"Doctor with id {id} not found" });
        }

        doctor.SpecializationId = dto.SpecializationId;
        doctor.LicenseNumber = dto.LicenseNumber;
        doctor.Qualifications = dto.Qualifications;
        doctor.Experience = dto.Experience;
        doctor.Bio = dto.Bio;
        doctor.IsAvailable = dto.IsAvailable;
        doctor.Department = dto.Department;
        doctor.ConsultationFee = dto.ConsultationFee;
        doctor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new DoctorResponseDto
        {
            Id = doctor.Id,
            UserId = doctor.UserId,
            SpecializationId = doctor.SpecializationId,
            LicenseNumber = doctor.LicenseNumber,
            Qualifications = doctor.Qualifications,
            Experience = doctor.Experience,
            Bio = doctor.Bio,
            Rating = doctor.Rating,
            IsAvailable = doctor.IsAvailable,
            Department = doctor.Department,
            ConsultationFee = doctor.ConsultationFee,
            CreatedAt = doctor.CreatedAt,
            UpdatedAt = doctor.UpdatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
        {
            return NotFound(new { message = $"Doctor with id {id} not found" });
        }

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Doctor with id {id} deleted successfully" });
    }
}