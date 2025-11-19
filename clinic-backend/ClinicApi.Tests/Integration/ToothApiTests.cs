using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore; // FIX: Added this using directive
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ClinicApi.Tests.Integration
{
    public class ToothApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public ToothApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetTeeth_WhenTeethExist_ReturnsOkAndListOfTeeth()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            await TestDataSeeder.SeedToothAsync(context, patient);
            await TestDataSeeder.SeedToothAsync(context, patient);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Teeth");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var teeth = await response.Content.ReadFromJsonAsync<List<ToothDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            teeth.Should().NotBeNull();
            teeth.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetTooth_WhenIdExists_ReturnsOkAndTooth()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            var seededTooth = await TestDataSeeder.SeedToothAsync(context, patient);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Teeth/{seededTooth.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var tooth = await response.Content.ReadFromJsonAsync<ToothDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            tooth.Should().NotBeNull();
            tooth!.id.Should().Be(seededTooth.id);
        }

        [Fact]
        public async Task GetTooth_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Teeth/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateTooth_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            // Ensure at least one status exists to be found
            await TestDataSeeder.SeedToothStatusAsync(context); 
            var toothStatus = await context.ToothStatus.FirstAsync(); 

            var toothDto = new ToothDTO
            {
                patient_id = patient.id,
                tooth_status_id = toothStatus.id,
                tooth_number = 15,
                tooth_name = "Upper Left Second Molar"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Teeth", JsonSnakeCaseSerializer.From(toothDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdTooth = await response.Content.ReadFromJsonAsync<ToothDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdTooth.Should().NotBeNull();
            createdTooth!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateTooth_WithInvalidPatientId_ReturnsBadRequest()
        {
            // Arrange
            var toothDto = new ToothDTO
            {
                patient_id = Guid.NewGuid(), // Non-existent Patient ID
                tooth_status_id = Guid.NewGuid(),
                tooth_number = 18,
                tooth_name = "Lower Left First Molar"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Teeth", JsonSnakeCaseSerializer.From(toothDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateTooth_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            var seededTooth = await TestDataSeeder.SeedToothAsync(context, patient);

            var updateDto = new ToothDTO
            {
                id = seededTooth.id,
                patient_id = seededTooth.patient_id,
                tooth_status_id = seededTooth.tooth_status_id,
                tooth_number = 20, // Updated value
                tooth_name = "Updated Tooth Name" // Updated value
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Teeth/{seededTooth.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedTooth = await response.Content.ReadFromJsonAsync<ToothDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedTooth.Should().NotBeNull();
            updatedTooth!.tooth_number.Should().Be(20);
            updatedTooth.tooth_name.Should().Be("Updated Tooth Name");
        }

        [Fact]
        public async Task DeleteTooth_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            var seededTooth = await TestDataSeeder.SeedToothAsync(context, patient);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Teeth/{seededTooth.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Teeth/{seededTooth.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}