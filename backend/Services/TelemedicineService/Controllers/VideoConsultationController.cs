using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AgoraIO.Media;
using TelemedicineService.Clients;
using TelemedicineService.Models;

namespace TelemedicineService.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/telemedicine/video")]
    [Route("api/v1/telemedicine/video")]
    public class VideoConsultationController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAppointmentLookupClient _appointmentLookupClient;
        private readonly IUserProfileLookupClient _userProfileLookupClient;
        private readonly ILogger<VideoConsultationController> _logger;

        public VideoConsultationController(
            IConfiguration configuration,
            IAppointmentLookupClient appointmentLookupClient,
            IUserProfileLookupClient userProfileLookupClient,
            ILogger<VideoConsultationController> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _appointmentLookupClient = appointmentLookupClient;
            _userProfileLookupClient = userProfileLookupClient;
            _logger = logger;
        }

        /// <summary>
        /// Generate an Agora RTC token for the appointment channel (expires in 1 hour).
        /// GET /api/telemedicine/video/token/{appointmentId}
        /// </summary>
        [HttpGet("token/{appointmentId}")]
        public async Task<IActionResult> GetToken(string appointmentId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(appointmentId))
                return BadRequest(new { error = "appointmentId is required" });

            if (!int.TryParse(appointmentId, out var numericAppointmentId))
                return BadRequest(new { error = "appointmentId must be a valid numeric appointment id" });

            AppointmentSnapshot? appointment;
            try
            {
                appointment = await _appointmentLookupClient.GetAppointmentAsync(numericAppointmentId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Appointment lookup failed for appointment {AppointmentId}", numericAppointmentId);
                return StatusCode(503, new { error = "Appointment service unavailable" });
            }

            if (appointment is null)
            {
                return NotFound(new { error = "Appointment not found" });
            }

            var caller = SessionUserContext.FromClaims(User);
            if (string.IsNullOrWhiteSpace(caller.UserId))
            {
                return StatusCode(403, new { error = "Authenticated user identity is required" });
            }

            if (caller.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase) && caller.PatientId is null)
            {
                caller.PatientId = await _userProfileLookupClient.GetPatientIdByUserIdAsync(caller.UserId, cancellationToken);
            }

            if (caller.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase) && caller.DoctorId is null)
            {
                caller.DoctorId = await _userProfileLookupClient.GetDoctorIdByUserIdAsync(caller.UserId, cancellationToken);
            }

            var isDoctor = caller.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase)
                           && caller.DoctorId == appointment.DoctorId;
            var isPatient = caller.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase)
                            && caller.PatientId == appointment.PatientId;
            var isAdmin = caller.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            if (!isDoctor && !isPatient && !isAdmin)
            {
                return StatusCode(403, new
                {
                    error = "User is not assigned to this appointment",
                    resolvedDoctorId = caller.DoctorId,
                    resolvedPatientId = caller.PatientId,
                    appointmentDoctorId = appointment.DoctorId,
                    appointmentPatientId = appointment.PatientId,
                    callerRole = caller.Role,
                    callerUserId = caller.UserId
                });
            }

            var appId = _configuration["Agora:AppId"];
            var appCertificate = _configuration["Agora:AppCertificate"];

            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appCertificate))
            {
                _logger.LogError("Agora AppId or AppCertificate missing from configuration.");
                return StatusCode(500, new { error = "Server misconfiguration: Agora credentials missing" });
            }

            // Generate a random uid (uint)
            var uid = GenerateRandomUid();

            // Token expiry: 1 hour from now
            const int expirySeconds = 3600;
            var currentTs = (int)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var privilegeExpiredTs = currentTs + expirySeconds;

            // Build token using AgoraToken package API.
            // Note: the exact method/signature may vary by package version; adjust if needed.
            string token;
            try
            {
                token = RtcTokenBuilder.buildTokenWithUID(
                    appID: appId,
                    appCertificate: appCertificate,
                    channelName: appointmentId,
                    uid: uid,
                    role: RtcTokenBuilder.Role.RolePublisher,
                    privilegeExpiredTs: (uint)privilegeExpiredTs
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Agora token for channel {Channel}", appointmentId);
                return StatusCode(500, new { error = "Failed to generate token" });
            }

            return Ok(new
            {
                token,
                channelName = appointmentId,
                uid,
                expiresAtUtc = DateTimeOffset.FromUnixTimeSeconds(privilegeExpiredTs).UtcDateTime
            });
        }

        private static uint GenerateRandomUid()
        {
            // Use a cryptographically secure RNG to produce a non-zero uint uid
            var bytes = new byte[4];
            uint uid;
            do
            {
                RandomNumberGenerator.Fill(bytes);
                uid = BitConverter.ToUInt32(bytes, 0);
            } while (uid == 0);

            return uid;
        }
    }
}