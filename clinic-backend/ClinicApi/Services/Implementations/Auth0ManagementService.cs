using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using ClinicApi.Auth;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace ClinicApi.Services.Implementations
{
    public class Auth0ManagementService : IAuth0ManagementService
    {
        private readonly HttpClient _httpClient;
        private readonly Auth0Settings _settings;
        private readonly IMemoryCache _cache;
        private const string TokenCacheKey = "Auth0ManagementToken";

        public Auth0ManagementService(
            HttpClient httpClient, 
            IOptions<Auth0Settings> settings,
            IMemoryCache cache)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _cache = cache;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            if (_cache.TryGetValue(TokenCacheKey, out string token))
            {
                return token;
            }

            var request = new HttpRequestMessage(HttpMethod.Post, $"https://{_settings.Domain}/oauth/token")
            {
                Content = JsonContent.Create(new
                {
                    client_id = _settings.ManagementClientId,
                    client_secret = _settings.ManagementClientSecret,
                    audience = $"https://{_settings.Domain}/api/v2/",
                    grant_type = "client_credentials"
                })
            };
            var response = await _httpClient.SendAsync(request);

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            token = result.GetProperty("access_token").GetString();
            var expiresIn = result.GetProperty("expires_in").GetInt32();

            _cache.Set(TokenCacheKey, token, TimeSpan.FromSeconds(expiresIn - 60));
            return token;
        }

        public async Task<string> CreateUserAsync(string email, string roleName, string staffId, string personId)
        {
            var token = await GetAccessTokenAsync();
            
            var request = new HttpRequestMessage(HttpMethod.Post, $"https://{_settings.Domain}/api/v2/users")
            {
                Content = JsonContent.Create(new
                {
                    email = email,
                    connection = _settings.Connection,
                    password = Guid.NewGuid().ToString() + "!",
                    user_metadata = new
                    {
                        role = roleName,
                        staff_id = staffId,
                        person_id = personId,
                        needs_profile_completion = true
                    },
                    email_verified = true,
                    verify_email = false
                })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to create Auth0 user: {error}");
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            return result.GetProperty("user_id").GetString();
        }

        public async Task<string> GeneratePasswordResetLinkAsync(string auth0UserId)
        {
            var token = await GetAccessTokenAsync();

            var request = new HttpRequestMessage(HttpMethod.Post, $"https://{_settings.Domain}/api/v2/tickets/password-change")
            {
                Content = JsonContent.Create(new
                {
                    user_id = auth0UserId,
                    result_url = $"{_settings.PortalBaseUrl}/login"
                })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            return result.GetProperty("ticket").GetString();
        }

        public async Task UpdateUserMetadataAsync(string auth0UserId, object metadata)
        {
            var token = await GetAccessTokenAsync();

            var request = new HttpRequestMessage(HttpMethod.Patch, $"https://{_settings.Domain}/api/v2/users/{auth0UserId}")
            {
                Content = JsonContent.Create(new
                {
                    user_metadata = metadata
                })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
        }
    }
}
