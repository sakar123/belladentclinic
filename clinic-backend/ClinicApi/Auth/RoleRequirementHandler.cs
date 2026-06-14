using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ClinicApi.Auth;

public class RoleRequirementHandler : AuthorizationHandler<RoleRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        // For NoAuth scenario (dev mode)
        if (context.User.Identity?.AuthenticationType == "NoAuth" && context.User.HasClaim(c => c.Type == "https://clinic.app/roles" && c.Value == "Administrator"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Production scenario
        var roleClaims = context.User.FindAll(c => c.Type == "https://clinic.app/roles").Select(c => c.Value).ToList();
        
        // Some identity providers might put multiple roles in a single claim as an array string or multiple claims
        if (roleClaims.Count == 1 && roleClaims[0].StartsWith("["))
        {
            try 
            {
                var rolesArray = System.Text.Json.JsonSerializer.Deserialize<string[]>(roleClaims[0]);
                if (rolesArray != null)
                {
                    roleClaims = rolesArray.ToList();
                }
            }
            catch {}
        }

        if (roleClaims.Any(role => requirement.AllowedRoles.Contains(role)))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
