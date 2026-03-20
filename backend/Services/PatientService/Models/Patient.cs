namespace PatientService.Models;

public class Patient 
{
    public int Id { get; set; }
    public int UserId { get; set; } // Links to AuthService user
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Phone { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string BloodGroup { get; set; }

    //Temparary commont for now, will be removed later
    //public List<MedicalReport> MedicalReports { get; set; }

}