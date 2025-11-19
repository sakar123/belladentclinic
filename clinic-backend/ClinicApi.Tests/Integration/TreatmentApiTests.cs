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
    public class TreatmentApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public TreatmentApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetTreatments_WhenTreatmentsExist_ReturnsOkAndListOfTreatments()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);
            await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Treatments");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var treatments = await response.Content.ReadFromJsonAsync<List<TreatmentDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            treatments.Should().NotBeNull();
            treatments.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetTreatment_WhenIdExists_ReturnsOkAndTreatment()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededTreatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Treatments/{seededTreatment.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var treatment = await response.Content.ReadFromJsonAsync<TreatmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            treatment.Should().NotBeNull();
            treatment!.id.Should().Be(seededTreatment.id);
        }

        [Fact]
        public async Task GetTreatment_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Treatments/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateTreatment_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            // Seed all necessary dependencies for a valid treatment
            var (patient, _, tooth, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            var staff = await TestDataSeeder.SeedStaffAsync(context);
            var status = await TestDataSeeder.SeedAppointmentStatusAsync(context, $"Status-{Guid.NewGuid()}");
            var appointment = await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);
            var service = await TestDataSeeder.SeedServiceAsync(context);
            
            var treatmentDto = new TreatmentDTO
            {
                appointment_id = appointment.id,
                patient_id = patient.id,
                staff_id = staff.id,
                service_id = service.id,
                tooth_number = tooth.tooth_number,
                notes = "Integration test treatment"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Treatments", JsonSnakeCaseSerializer.From(treatmentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdTreatment = await response.Content.ReadFromJsonAsync<TreatmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdTreatment.Should().NotBeNull();
            createdTreatment!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateTreatment_WithInvalidPatientId_ReturnsBadRequest()
        {
            // Arrange
            var treatmentDto = new TreatmentDTO
            {
                appointment_id = Guid.NewGuid(),
                patient_id = Guid.NewGuid(), // Invalid ID
                staff_id = Guid.NewGuid(),
                service_id = Guid.NewGuid(),
                notes = "Test"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Treatments", JsonSnakeCaseSerializer.From(treatmentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateTreatment_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededTreatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);

            var updateDto = new TreatmentDTO
            {
                id = seededTreatment.id,
                appointment_id = seededTreatment.appointment_id,
                patient_id = seededTreatment.patient_id,
                staff_id = seededTreatment.staff_id,
                service_id = seededTreatment.service_id,
                notes = "Updated notes for integration test" // Updated value
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Treatments/{seededTreatment.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedTreatment = await response.Content.ReadFromJsonAsync<TreatmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedTreatment.Should().NotBeNull();
            updatedTreatment!.notes.Should().Be("Updated notes for integration test");
        }

        [Fact]
        public async Task DeleteTreatment_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededTreatment = await TestDataSeeder.SeedFullTreatmentScenarioAsync(context);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Treatments/{seededTreatment.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Treatments/{seededTreatment.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
