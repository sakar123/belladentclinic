using System;
using System.IO;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using ClinicApi.Models.AppSettings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ClinicApi.Services.Implementations
{
    public class S3FileStorageService : IFileStorageService, IDisposable
    {
        private readonly IAmazonS3 _s3Client;
        private readonly S3Settings _settings;
        private readonly ILogger<S3FileStorageService> _logger;

        public S3FileStorageService(IOptions<S3Settings> settings, ILogger<S3FileStorageService> logger)
        {
            _settings = settings.Value;
            _logger = logger;

            var region = string.IsNullOrWhiteSpace(_settings.Region) ? "ap-south-1" : _settings.Region;
            _s3Client = new AmazonS3Client(RegionEndpoint.GetBySystemName(region));
        }

        public async Task<string> UploadAsync(string key, Stream content, string contentType)
        {
            var request = new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                InputStream = content,
                ContentType = contentType
            };
            await _s3Client.PutObjectAsync(request);
            _logger.LogInformation("Uploaded file to S3: {Key}", key);
            return key;
        }

        public Task<string> GetPresignedUrlAsync(string key)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddMinutes(_settings.PresignedUrlExpiryMinutes),
                Verb = HttpVerb.GET
            };
            var url = _s3Client.GetPreSignedURL(request);
            return Task.FromResult(url);
        }

        public async Task DeleteAsync(string key)
        {
            try
            {
                await _s3Client.DeleteObjectAsync(_settings.BucketName, key);
                _logger.LogInformation("Deleted file from S3: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file from S3: {Key}", key);
            }
        }

        public void Dispose() => (_s3Client as IDisposable)?.Dispose();
    }
}
