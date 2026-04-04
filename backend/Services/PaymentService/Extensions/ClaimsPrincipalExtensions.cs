using System.Security.Claims;

namespace PaymentService.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user)
    {
        // Try multiple claim types (in order of priority)
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? user.FindFirst("sub")?.Value
                  ?? user.FindFirst("id")?.Value
                  ?? user.FindFirst("UserId")?.Value
                  ?? user.FindFirst("nameid")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        return userId;
    }

    public static string GetUserEmail(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value
               ?? user.FindFirst("email")?.Value
               ?? user.Identity?.Name;
    }

    public static string GetUserRole(this ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value
               ?? user.FindFirst("role")?.Value
               ?? "Patient";
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        var role = user.GetUserRole();
        return role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsDoctor(this ClaimsPrincipal user)
    {
        var role = user.GetUserRole();
        return role.Equals("Doctor", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsPatient(this ClaimsPrincipal user)
    {
        var role = user.GetUserRole();
        return role.Equals("Patient", StringComparison.OrdinalIgnoreCase);
    }
}