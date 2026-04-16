namespace TelemedicineService.Clients;

public interface IUserProfileLookupClient
{
    Task<int?> GetPatientIdByUserIdAsync(string userId, CancellationToken cancellationToken);
    Task<int?> GetDoctorIdByUserIdAsync(string userId, CancellationToken cancellationToken);
}
