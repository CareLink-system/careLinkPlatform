using System.Security.Claims;

namespace TelemedicineService.Models;

public class SessionUserContext
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = "Patient";
    public string DisplayName { get; set; } = "Unknown";

    public int? DoctorId { get; set; }
    public int? PatientId { get; set; }

    public static SessionUserContext FromClaims(ClaimsPrincipal principal)
    {
        var userId =
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            principal.FindFirst("sub")?.Value ??
            principal.FindFirst("userId")?.Value ??
            principal.FindFirst(ClaimTypes.Email)?.Value ??
            string.Empty;

        var role =
            principal.FindFirst(ClaimTypes.Role)?.Value ??
            principal.FindFirst("role")?.Value ??
            "Patient";

        var displayName =
            principal.FindFirst(ClaimTypes.Name)?.Value ??
            principal.FindFirst(ClaimTypes.Email)?.Value ??
            userId;

        int? doctorId = ParseNullableInt(principal.FindFirst("doctorId")?.Value);
        int? patientId = ParseNullableInt(principal.FindFirst("patientId")?.Value);

        if (doctorId is null && role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            doctorId = ParseNullableInt(userId);
        }

        if (patientId is null && role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            patientId = ParseNullableInt(userId);
        }

        return new SessionUserContext
        {
            UserId = userId,
            Role = role,
            DisplayName = displayName,
            DoctorId = doctorId,
            PatientId = patientId
        };
    }

    private static int? ParseNullableInt(string? value)
        => int.TryParse(value, out var parsed) ? parsed : null;
}
