using AuthService.Models;

namespace AuthService;

public static class AuthControllerUsersStore
{
    public static List<User> Users { get; } = new();
}