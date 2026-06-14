using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace ClinicApi.Auth;

public class NoAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public NoAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Auto-authenticate all requests as Administrator when Auth0 is disabled
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "dev-user"),
            new Claim("https://clinic.app/roles", "Administrator")
        };
        var identity = new ClaimsIdentity(claims, "NoAuth");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "NoAuth");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
