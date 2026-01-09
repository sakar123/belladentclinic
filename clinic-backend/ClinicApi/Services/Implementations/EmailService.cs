using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using ClinicApi.Models.AppSettings;
using ClinicApi.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ClinicApi.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _emailSettings = _configuration.GetSection("EmailSettings").Get<EmailSettings>() ?? new EmailSettings();
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            // Prefer SMTP if configured (SES SMTP or any SMTP server). Otherwise fallback to SES API with default credentials.
            if (!string.IsNullOrWhiteSpace(_emailSettings.SmtpHost))
            {
                try
                {
                    using var client = new SmtpClient(_emailSettings.SmtpHost!, _emailSettings.SmtpPort > 0 ? _emailSettings.SmtpPort : 587)
                    {
                        Credentials = new NetworkCredential(_emailSettings.SmtpUser, _emailSettings.SmtpPass),
                        EnableSsl = true
                    };
                    using var message = new MailMessage(_emailSettings.From!, to, subject, body)
                    {
                        IsBodyHtml = true
                    };
                    await client.SendMailAsync(message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending email via SMTP to {To}", to);
                    // Do not throw: email is best-effort and should not break primary flows
                }
                return;
            }

            // Fallback to SES API using default credentials chain (env vars/instance profile).
            try
            {
                var region = string.IsNullOrWhiteSpace(_emailSettings.Region) ? "us-east-1" : _emailSettings.Region;
                using var ses = new AmazonSimpleEmailServiceClient(RegionEndpoint.GetBySystemName(region!));
                var sendRequest = new SendEmailRequest
                {
                    Source = _emailSettings.From,
                    Destination = new Destination { ToAddresses = new System.Collections.Generic.List<string> { to } },
                    Message = new Message
                    {
                        Subject = new Content(subject),
                        Body = new Body { Html = new Content { Charset = "UTF-8", Data = body } }
                    }
                };
                await ses.SendEmailAsync(sendRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email via SES API to {To}", to);
                // Do not throw: keep business flow resilient
            }
        }
    }
}
