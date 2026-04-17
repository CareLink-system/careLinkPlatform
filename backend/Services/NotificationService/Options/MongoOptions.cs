namespace NotificationService.Options;

public class MongoOptions
{
    public const string SectionName = "Mongo";

    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "notifications";
    public string CollectionName { get; set; } = "notificationRecords";
}
