namespace ClinicApi.Auth;

public class Auth0Settings
{
    public bool Enabled { get; set; } = false;
    public string Domain { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string ManagementClientId { get; set; } = string.Empty;
    public string ManagementClientSecret { get; set; } = string.Empty;
    public string PortalBaseUrl { get; set; } = "http://localhost:3000";
    public string Connection { get; set; } = "staff-database";
}
