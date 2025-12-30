using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
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
            _logger.LogWarning("Google Reviews service is returning mock data. Google API integration is currently disabled.");
            return await Task.FromResult(new List<GoogleReviewDto>
            {
                new GoogleReviewDto { AuthorName = "John Doe", Rating = 5, Text = "This is a great place!", RelativeTimeDescription = "a week ago" },
                new GoogleReviewDto { AuthorName = "Jane Smith", Rating = 5, Text = "Amazing experience!", RelativeTimeDescription = "2 weeks ago" }
            });
        }
    }
}

