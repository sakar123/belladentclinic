using System.Threading.Tasks;
using ClinicApi.Models.DTOs.Notifications;

namespace ClinicApi.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task<EmailSendResult> TrySendEmailAsync(string to, string subject, string htmlBody, string? textBody = null);
    }
}
