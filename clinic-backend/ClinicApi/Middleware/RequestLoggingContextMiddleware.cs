using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace ClinicApi.Middleware;

public class RequestLoggingContextMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggingContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var request = context.Request;

        // Correlation id from header or create new
        const string correlationHeader = "X-Correlation-ID";
        var correlationId = request.Headers.TryGetValue(correlationHeader, out var cv) && !string.IsNullOrWhiteSpace(cv)
            ? cv.ToString()
            : Activity.Current?.Id ?? context.TraceIdentifier;

        // Ensure response carries correlation id
        context.Response.Headers[correlationHeader] = correlationId;

        // Basic request metadata
        var userId = context.User?.Identity?.IsAuthenticated == true
            ? (context.User.FindFirst("sub")?.Value ?? context.User.Identity?.Name ?? "")
            : string.Empty;
        var userName = context.User?.Identity?.IsAuthenticated == true
            ? (context.User.Identity?.Name ?? string.Empty)
            : string.Empty;

        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        var ua = request.Headers["User-Agent"].ToString();

        // Push properties to the Serilog LogContext for the full request lifetime
        using (LogContext.PushProperty("CorrelationId", correlationId, destructureObjects: false))
        using (LogContext.PushProperty("RequestId", context.TraceIdentifier, destructureObjects: false))
        using (LogContext.PushProperty("Method", request.Method, destructureObjects: false))
        using (LogContext.PushProperty("Path", request.Path.HasValue ? request.Path.Value : string.Empty, destructureObjects: false))
        using (LogContext.PushProperty("QueryString", request.QueryString.HasValue ? request.QueryString.Value : string.Empty, destructureObjects: false))
        using (LogContext.PushProperty("ClientIp", clientIp, destructureObjects: false))
        using (LogContext.PushProperty("UserAgent", ua, destructureObjects: false))
        using (LogContext.PushProperty("UserId", userId, destructureObjects: false))
        using (LogContext.PushProperty("UserName", userName, destructureObjects: false))
        {
            await _next(context);
        }
    }
}

