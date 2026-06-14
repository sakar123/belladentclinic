using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;

namespace ClinicApi.Auth;

public class RoleRequirement : IAuthorizationRequirement
{
    public IReadOnlyList<string> AllowedRoles { get; }

    public RoleRequirement(params string[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }
}
