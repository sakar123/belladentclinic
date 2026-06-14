using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicApi.Services
{
    public interface IAuth0ManagementService
    {
        Task<string> CreateUserAsync(string email, string roleName, string staffId, string personId);
        Task<string> GeneratePasswordResetLinkAsync(string auth0UserId);
        Task UpdateUserMetadataAsync(string auth0UserId, object metadata);
    }
}
