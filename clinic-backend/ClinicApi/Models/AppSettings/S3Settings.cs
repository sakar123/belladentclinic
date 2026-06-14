namespace ClinicApi.Models.AppSettings
{
    public class S3Settings
    {
        public string? Region { get; set; }
        public string? BucketName { get; set; }
        public string KeyPrefix { get; set; } = "documents";
        public int PresignedUrlExpiryMinutes { get; set; } = 15;
    }
}
