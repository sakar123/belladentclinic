using System.Threading.Tasks;
using ClinicApi.Middleware;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace ClinicApi.Tests.Unit.Middleware;

public class RequestLoggingContextMiddlewareTests
{
    [Fact]
    public async Task Invoke_SetsCorrelationHeader()
    {
        var context = new DefaultHttpContext();
        var middleware = new RequestLoggingContextMiddleware(_ => Task.CompletedTask);

        await middleware.Invoke(context);

        context.Response.Headers.ContainsKey("X-Correlation-ID").Should().BeTrue();
    }
}

