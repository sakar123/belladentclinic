namespace ClinicApi.Models.AppSettings
{
    public class EmailSettings
    {
        public string? Region { get; set; }
        public string? SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string? SmtpUser { get; set; }
        public string? SmtpPass { get; set; }
        public string? From { get; set; }
    }
}
