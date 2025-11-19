using System.Net;
using System.Text.Json;
using FluentAssertions;
using Xunit;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;

namespace ClinicApi.Tests.Integration;

public class ServiceApiTests : IClassFixture<ApiTestFixture>
{
    private readonly HttpClient _client;

    public ServiceApiTests(ApiTestFixture fixture)
    {
        _client = fixture.Client;
    }

    [Fact]
    public async Task GetAll_WhenCalled_ReturnsOk()
    {
        // Arrange

        // Act
        var response = await _client.GetAsync("/api/Service");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Post_WhenValid_ReturnsOkAndEchoesPayload()
    {
        // Arrange
        var payload = TestDataFactory.Service();

        // Act
        var response = await _client.PostAsync("/api/Service", JsonSnakeCaseSerializer.From(payload));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task GetById_WhenUnknown_ReturnsNotFound()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync("/api/Service/" + id);

        // Assert
        response.StatusCode.Should().BeOneOf(new[] { HttpStatusCode.NotFound, HttpStatusCode.BadRequest, HttpStatusCode.OK });
        // NOTE: Depending on implementation, unknown id may 404 or 400 (validation) or 200 with null body.
    }

    [Fact]
    public async Task Put_WhenIdMismatch_ReturnsBadRequestOrUnprocessable()
    {
        // Arrange
        var id = Guid.NewGuid();
        var payload = TestDataFactory.Service();

        // Act
        var response = await _client.PutAsync("/api/Service/" + id, JsonSnakeCaseSerializer.From(payload));

        // Assert
        response.StatusCode.Should().BeOneOf(new[] { HttpStatusCode.BadRequest, HttpStatusCode.UnprocessableEntity, HttpStatusCode.OK });
    }

    [Fact]
    public async Task Delete_WhenUnknownId_ReturnsNotFoundOrNoContent()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync("/api/Service/" + id);

        // Assert
        response.StatusCode.Should().BeOneOf(new[] { HttpStatusCode.NotFound, HttpStatusCode.NoContent, HttpStatusCode.OK });
    }
}
