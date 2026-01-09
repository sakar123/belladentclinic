using System.Net;
using ClinicApi.Tests.Fixtures;
using FluentAssertions;
using Xunit;

namespace ClinicApi.Tests.Integration;

public class TestControllerTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fx;
    public TestControllerTests(ApiTestFixture fx) => _fx = fx;

    [Fact]
    public async Task Seed_ReturnsOk()
    {
        var resp = await _fx.Client.PostAsync("/api/Test/seed", content: null);
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var text = await resp.Content.ReadAsStringAsync();
        text.Should().Contain("seeded");
    }
}

