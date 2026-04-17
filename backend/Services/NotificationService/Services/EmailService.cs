using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using NotificationService.Options;

namespace NotificationService.Services;

public interface IEmailService
{
    Task SendAsync(string recipient, string subject, string body, CancellationToken cancellationToken = default);
}

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly NotificationProvidersOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        HttpClient httpClient,
        IOptions<NotificationProvidersOptions> options,
        ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(_options.NodeMailerEndpoint))
        {
            await SendViaNodeMailerBridge(recipient, subject, body, cancellationToken);
            return;
        }

        await SendViaBrevo(recipient, subject, body, cancellationToken);
    }

    private async Task SendViaNodeMailerBridge(string recipient, string subject, string body, CancellationToken cancellationToken)
    {
        var payload = new
        {
            to = recipient,
            subject,
            text = body,
            html = $"<p>{System.Net.WebUtility.HtmlEncode(body)}</p>"
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, _options.NodeMailerEndpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"NodeMailer bridge send failed: {(int)response.StatusCode} - {responseBody}");
        }

        _logger.LogInformation("Email sent via NodeMailer bridge to {Recipient}", recipient);
    }

    private async Task SendViaBrevo(string recipient, string subject, string body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.BrevoApiKey))
        {
            throw new InvalidOperationException("BrevoApiKey is not configured. Set NotificationProviders:BrevoApiKey or use NodeMailerEndpoint.");
        }

        if (string.IsNullOrWhiteSpace(_options.BrevoSenderEmail))
        {
            throw new InvalidOperationException("BrevoSenderEmail is not configured.");
        }

        var payload = new
        {
            sender = new
            {
                name = _options.BrevoSenderName,
                email = _options.BrevoSenderEmail
            },
            to = new[] { new { email = recipient } },
            subject,
            textContent = body,
            htmlContent = $"<p>{System.Net.WebUtility.HtmlEncode(body)}</p>"
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Add("api-key", _options.BrevoApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Brevo send failed: {(int)response.StatusCode} - {responseBody}");
        }

        _logger.LogInformation("Email sent via Brevo to {Recipient}", recipient);
    }
}
