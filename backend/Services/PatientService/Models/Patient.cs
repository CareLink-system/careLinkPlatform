namespace PatientService.Models;

using PatientService.Models.Common;
using System;

public class Patient : AuditableEntity
{
    public int Id { get; set; }
    public Guid UserId { get; set; } // Links to AuthService user
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string DateOfBirth { get; set; } = default!; // yyyy-MM-dd format
    public string Gender { get; set; } = default!;
    public string BloodGroup { get; set; } = default!;
}