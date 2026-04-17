namespace NotificationService.Options;

public class NotificationProvidersOptions
{
    public const string SectionName = "NotificationProviders";

    public string NodeMailerEndpoint { get; set; } = string.Empty;
    public string BrevoApiKey { get; set; } = string.Empty;
    public string BrevoSenderEmail { get; set; } = string.Empty;
    public string BrevoSenderName { get; set; } = "CareLink";
    public string NotifyLkApiUrl { get; set; } = "https://app.notify.lk/api/v1/send";
    public string NotifyLkUserId { get; set; } = string.Empty;
    public string NotifyLkApiKey { get; set; } = string.Empty;
    public string NotifyLkSenderId { get; set; } = "CareLink";
}
