using DoctorService.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DoctorService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    [HttpGet]
    public ActionResult<List<DoctorResponseDto>> GetAllDoctors()
    {
        var doctors = new List<DoctorResponseDto>
        {
            new DoctorResponseDto
            {
                Id = 1,
                UserId = 101,
                SpecializationId = "CARD",
                LicenseNumber = "LIC12345",
                Qualifications = "MBBS, MD",
                Experience = "5 years",
                Bio = "Cardiologist with experience in heart care",
                Rating = 4.5,
                IsAvailable = true,
                Department = "Cardiology",
                ConsultationFee = 3000,
                CreatedAt = DateTime.UtcNow
            },
            new DoctorResponseDto
            {
                Id = 2,
                UserId = 102,
                SpecializationId = "DERM",
                LicenseNumber = "LIC67890",
                Qualifications = "MBBS, Diploma in Dermatology",
                Experience = "3 years",
                Bio = "Skin specialist",
                Rating = 4.2,
                IsAvailable = true,
                Department = "Dermatology",
                ConsultationFee = 2500,
                CreatedAt = DateTime.UtcNow
            }
        };

        return Ok(doctors);
    }

    [HttpGet("{id}")]
    public ActionResult<DoctorResponseDto> GetDoctorById(int id)
    {
        if (id != 1)
        {
            return NotFound(new { message = $"Doctor with id {id} not found" });
        }

        var doctor = new DoctorResponseDto
        {
            Id = 1,
            UserId = 101,
            SpecializationId = "CARD",
            LicenseNumber = "LIC12345",
            Qualifications = "MBBS, MD",
            Experience = "5 years",
            Bio = "Cardiologist with experience in heart care",
            Rating = 4.5,
            IsAvailable = true,
            Department = "Cardiology",
            ConsultationFee = 3000,
            CreatedAt = DateTime.UtcNow
        };

        return Ok(doctor);
    }

    [HttpPost]
    public ActionResult<DoctorResponseDto> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        var createdDoctor = new DoctorResponseDto
        {
            Id = 3,
            UserId = dto.UserId,
            SpecializationId = dto.SpecializationId,
            LicenseNumber = dto.LicenseNumber,
            Qualifications = dto.Qualifications,
            Experience = dto.Experience,
            Bio = dto.Bio,
            Rating = 0,
            IsAvailable = dto.IsAvailable,
            Department = dto.Department,
            ConsultationFee = dto.ConsultationFee,
            CreatedAt = DateTime.UtcNow
        };

        return CreatedAtAction(nameof(GetDoctorById), new { id = createdDoctor.Id }, createdDoctor);
    }

    [HttpPut("{id}")]
    public ActionResult<DoctorResponseDto> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
    {
        var updatedDoctor = new DoctorResponseDto
        {
            Id = id,
            UserId = 101,
            SpecializationId = dto.SpecializationId,
            LicenseNumber = dto.LicenseNumber,
            Qualifications = dto.Qualifications,
            Experience = dto.Experience,
            Bio = dto.Bio,
            Rating = 4.5,
            IsAvailable = dto.IsAvailable,
            Department = dto.Department,
            ConsultationFee = dto.ConsultationFee,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            UpdatedAt = DateTime.UtcNow
        };

        return Ok(updatedDoctor);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteDoctor(int id)
    {
        return Ok(new { message = $"Doctor with id {id} deleted successfully" });
    }
}