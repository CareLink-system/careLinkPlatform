using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AgoraIO.Media;

namespace TelemedicineService.Controllers
{
    [ApiController]
    [Route("api/telemedicine/video")]
    public class VideoConsultationController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<VideoConsultationController> _logger;

        public VideoConsultationController(IConfiguration configuration, ILogger<VideoConsultationController> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger;
        }

        /// <summary>
        /// Generate an Agora RTC token for the appointment channel (expires in 1 hour).
        /// GET /api/telemedicine/video/token/{appointmentId}
        /// </summary>
        [HttpGet("token/{appointmentId}")]
        public IActionResult GetToken(string appointmentId)
        {
            if (string.IsNullOrWhiteSpace(appointmentId))
                return BadRequest(new { error = "appointmentId is required" });

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
                uid
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