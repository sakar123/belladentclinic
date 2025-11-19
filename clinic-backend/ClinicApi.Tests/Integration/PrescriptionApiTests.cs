using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ClinicApi.Tests.Integration
{
    public class PrescriptionApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public PrescriptionApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetPrescriptions_WhenPrescriptionsExist_ReturnsOkAndListOfPrescriptions()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var treatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            await TestDataSeeder.SeedPrescriptionAsync(context, treatment.id);
            await TestDataSeeder.SeedPrescriptionAsync(context, treatment.id);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Prescription");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var prescriptions = await response.Content.ReadFromJsonAsync<List<PrescriptionDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            prescriptions.Should().NotBeNull();
            prescriptions.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetPrescription_WhenIdExists_ReturnsOkAndPrescription()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var treatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            var seededPrescription = await TestDataSeeder.SeedPrescriptionAsync(context, treatment.id);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Prescription/{seededPrescription.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var prescription = await response.Content.ReadFromJsonAsync<PrescriptionDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            prescription.Should().NotBeNull();
            prescription!.id.Should().Be(seededPrescription.id);
        }

        [Fact]
        public async Task GetPrescription_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Prescription/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreatePrescription_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var treatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            
            var prescriptionDto = new PrescriptionDTO
            {
                treatment_id = treatment.id,
                drug_name = "Amoxicillin",
                dosage = "500mg",
                instructions = "Take one tablet twice daily."
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Prescription", JsonSnakeCaseSerializer.From(prescriptionDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdPrescription = await response.Content.ReadFromJsonAsync<PrescriptionDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdPrescription.Should().NotBeNull();
            createdPrescription!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
        }

        [Fact]
        public async Task CreatePrescription_WithInvalidTreatmentId_ReturnsBadRequest()
        {
            // Arrange
            var prescriptionDto = new PrescriptionDTO
            {
                treatment_id = Guid.NewGuid(), // Non-existent ID
                drug_name = "Ibuprofen",
                dosage = "200mg"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Prescription", JsonSnakeCaseSerializer.From(prescriptionDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdatePrescription_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var treatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            var seededPrescription = await TestDataSeeder.SeedPrescriptionAsync(context, treatment.id);

            var updateDto = new PrescriptionDTO
            {
                id = seededPrescription.id,
                treatment_id = treatment.id,
                drug_name = "Updated Drug Name", // Updated value
                dosage = "1000mg", // Updated value
                instructions = seededPrescription.instructions
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Prescription/{seededPrescription.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedPrescription = await response.Content.ReadFromJsonAsync<PrescriptionDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedPrescription.Should().NotBeNull();
            updatedPrescription!.drug_name.Should().Be("Updated Drug Name");
            updatedPrescription.dosage.Should().Be("1000mg");
        }

        [Fact]
        public async Task DeletePrescription_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var treatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            var seededPrescription = await TestDataSeeder.SeedPrescriptionAsync(context, treatment.id);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Prescription/{seededPrescription.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Prescription/{seededPrescription.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
