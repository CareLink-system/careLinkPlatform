//using AuthService.DTOs.Auth;
//using AuthService.DTOs.Users;

//namespace AuthService.Services.AuthService;

//public interface IAuthService
//{
//    Task<AuthResponseDto> RegisterAsync(
//        UserRegisterDto request,
//        string currentUserId,
//        string userIp,
//        CancellationToken cancellationToken = default);

//    Task<AuthResponseDto> LoginAsync(
//        UserLoginDto request,
//        string userIp,
//        CancellationToken cancellationToken = default);

//    Task<bool> ChangePasswordAsync(
//        int userId,
//        string oldPassword,
//        string newPassword,
//        string currentUserId,
//        CancellationToken cancellationToken = default);
//}
