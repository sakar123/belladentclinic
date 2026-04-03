namespace ClinicApi.Models.AppSettings
{
    public class NotificationWorkerSettings
    {
        public int PollingIntervalSeconds { get; set; } = 10;
        public int BatchSize { get; set; } = 25;
    }
}
