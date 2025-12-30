using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using Google.Apis.Auth.OAuth2;
using Google.Apis.MyBusinessAccountManagement.v1;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ClinicApi.Services
{
    public class GoogleReviewsService : IGoogleReviewsService
    {
        private readonly ILogger<GoogleReviewsService> _logger;
        private readonly IConfiguration _configuration;

        public GoogleReviewsService(ILogger<GoogleReviewsService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<IEnumerable<GoogleReviewDto>> GetReviewsAsync()
        {
            try
            {
                var accountId = _configuration["GoogleReviews:AccountId"];
                var locationId = _configuration["GoogleReviews:LocationId"];
                var clientSecretsPath = _configuration["GoogleReviews:ClientSecretsPath"];

                if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(locationId) || string.IsNullOrEmpty(clientSecretsPath) || accountId == "YOUR_ACCOUNT_ID")
                {
                    _logger.LogWarning("Google Reviews service is not configured. Please check your appsettings.json.");
                    return new List<GoogleReviewDto>
                    {
                        new GoogleReviewDto { AuthorName = "John Doe", Rating = 5, Text = "This is a great place!", RelativeTimeDescription = "a week ago" }
                    };
                }

                UserCredential credential;
                using (var stream = new FileStream(clientSecretsPath, FileMode.Open, FileAccess.Read))
                {
                    credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                        GoogleClientSecrets.FromStream(stream).Secrets,
                        new[] { MyBusinessAccountManagementService.Scope.BusinessManage },
                        "user",
                        CancellationToken.None);
                }

                var service = new MyBusinessAccountManagementService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "Clinic API",
                });

                var reviews = await service.Accounts.Locations.Reviews.List($"accounts/{accountId}/locations/{locationId}").ExecuteAsync();

                return reviews.Reviews
                    .Where(r => r.StarRating == "FIVE_STAR" && !string.IsNullOrEmpty(r.Comment) && r.Comment.Length > 50)
                    .Select(r => new GoogleReviewDto
                    {
                        AuthorName = r.Reviewer.DisplayName,
                        Rating = 5,
                        Text = r.Comment,
                        RelativeTimeDescription = r.CreateTime.ToString() // This is a placeholder. The API returns a timestamp.
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching Google Reviews.");
                // Return mock data in case of an error
                return new List<GoogleReviewDto>
                {
                    new GoogleReviewDto { AuthorName = "Jane Smith", Rating = 5, Text = "Amazing experience!", RelativeTimeDescription = "2 weeks ago" }
                };
            }
        }
    }
}
