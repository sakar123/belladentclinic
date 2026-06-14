namespace ClinicApi.Models.DTOs.Notifications
{
    public class EmailSendResult
    {
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public string? MessageId { get; set; }

        public static EmailSendResult Ok(string? messageId = null) => new() { Success = true, MessageId = messageId };
        public static EmailSendResult Fail(string error) => new() { Success = false, ErrorMessage = error };
    }
}
