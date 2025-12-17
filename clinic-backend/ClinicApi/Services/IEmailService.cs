using System.Threading.Tasks;

namespace ClinicApi.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
