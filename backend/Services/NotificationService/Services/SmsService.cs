using System.Net;
using Microsoft.Extensions.Options;
using NotificationService.Options;

namespace NotificationService.Services;

public interface ISmsService
{
    Task SendAsync(string recipient, string message, CancellationToken cancellationToken = default);
}

public class SmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly NotificationProvidersOptions _options;
    private readonly ILogger<SmsService> _logger;

    public SmsService(
        HttpClient httpClient,
        IOptions<NotificationProvidersOptions> options,
        ILogger<SmsService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string message, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.NotifyLkUserId) ||
            string.IsNullOrWhiteSpace(_options.NotifyLkApiKey))
        {
            throw new InvalidOperationException("Notify.lk credentials are not configured.");
        }

        var formData = new Dictionary<string, string>
        {
            ["user_id"] = _options.NotifyLkUserId,
            ["api_key"] = _options.NotifyLkApiKey,
            ["sender_id"] = _options.NotifyLkSenderId,
            ["to"] = recipient,
            ["message"] = message
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, _options.NotifyLkApiUrl)
        {
            Content = new FormUrlEncodedContent(formData)
        };

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Notify.lk send failed: {(int)response.StatusCode} - {body}");
        }

        _logger.LogInformation("SMS sent via Notify.lk to {Recipient}", recipient);
    }
}
