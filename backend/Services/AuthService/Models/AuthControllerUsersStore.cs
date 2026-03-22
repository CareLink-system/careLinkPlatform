using AuthService.Models;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace AuthService;

public static class AuthControllerUsersStore
{
    public static List<ApplicationUser> Users { get; } = new();
}