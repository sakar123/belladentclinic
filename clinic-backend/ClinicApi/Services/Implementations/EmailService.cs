using System;
using System.Threading.Tasks;
using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using ClinicApi.Models.AppSettings;
using ClinicApi.Services;
using Microsoft.Extensions.Configuration;

namespace ClinicApi.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly EmailSettings _emailSettings;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _emailSettings = _configuration.GetSection("EmailSettings").Get<EmailSettings>();
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using (var client = new AmazonSimpleEmailServiceClient(_emailSettings.SmtpUser, _emailSettings.SmtpPass, RegionEndpoint.GetBySystemName(_emailSettings.Region)))
            {
                var sendRequest = new SendEmailRequest
                {
                    Source = _emailSettings.From,
                    Destination = new Destination
                    {
                        ToAddresses = new System.Collections.Generic.List<string> { to }
                    },
                    Message = new Message
                    {
                        Subject = new Content(subject),
                        Body = new Body
                        {
                            Html = new Content
                            {
                                Charset = "UTF-8",
                                Data = body
                            }
                        }
                    }
                };
                try
                {
                    await client.SendEmailAsync(sendRequest);
                }
                catch (Exception ex)
                {
                    // Log the error
                    Console.WriteLine("Error sending email: " + ex.Message);
                    throw;
                }
            }
        }
    }
}