using System.Net;
using System.Net.Http.Json;
using ClinicApi.Models.DTOs.Lookup;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;
using FluentAssertions;
using Xunit;

namespace ClinicApi.Tests.Integration.Lookup;

public class AppointmentStatusLookupTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fx;
    public AppointmentStatusLookupTests(ApiTestFixture fx) => _fx = fx;

    [Fact]
    public async Task Crud_Flow_Works()
    {
        // Create
        var create = new CreateAppointmentStatusDto { name = $"Status-{Guid.NewGuid()}" };
        var createResp = await _fx.Client.PostAsync("/api/lookup/AppointmentStatus", JsonSnakeCaseSerializer.From(create));
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResp.Content.ReadFromJsonAsync<AppointmentStatusDto>(JsonSnakeCaseSerializer.SerializerOptions);
        created.Should().NotBeNull();

        // GetAll
        var allResp = await _fx.Client.GetAsync("/api/lookup/AppointmentStatus");
        allResp.StatusCode.Should().Be(HttpStatusCode.OK);

        // GetById
        var getResp = await _fx.Client.GetAsync($"/api/lookup/AppointmentStatus/{created!.id}");
        getResp.StatusCode.Should().Be(HttpStatusCode.OK);

        // Update
        var updatedName = $"Updated-{Guid.NewGuid()}";
        var updateDto = new CreateAppointmentStatusDto { name = updatedName };
        var putResp = await _fx.Client.PutAsync($"/api/lookup/AppointmentStatus/{created.id}", JsonSnakeCaseSerializer.From(updateDto));
        putResp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var verify = await _fx.Client.GetFromJsonAsync<AppointmentStatusDto>($"/api/lookup/AppointmentStatus/{created.id}", JsonSnakeCaseSerializer.SerializerOptions);
        verify!.name.Should().Be(updatedName);

        // Delete
        var delResp = await _fx.Client.DeleteAsync($"/api/lookup/AppointmentStatus/{created.id}");
        delResp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var afterDel = await _fx.Client.GetAsync($"/api/lookup/AppointmentStatus/{created.id}");
        afterDel.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}

