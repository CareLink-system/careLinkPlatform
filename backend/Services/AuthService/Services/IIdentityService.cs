namespace AuthService.Services;

public interface IIdentityService
{
    string GetUserIdentity();
    string GetUserIpAddress();
}