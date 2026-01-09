using System.Net;
using System.Threading.Tasks;
using ClinicApi.Tests.Fixtures;
using FluentAssertions;
using Xunit;

namespace ClinicApi.Tests.Integration;

public class HealthCheckTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public HealthCheckTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_ReturnsHealthy()
    {
        var resp = await _fixture.Client.GetAsync("/HealthCheck");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var text = await resp.Content.ReadAsStringAsync();
        text.Should().Be("Healthy");
    }
}

