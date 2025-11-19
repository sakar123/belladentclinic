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
    public class PatientApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public PatientApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetPatients_WhenPatientsExist_ReturnsOkAndListOfPatients()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            await TestDataSeeder.SeedPatientAsync(context);
            await TestDataSeeder.SeedPatientAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Patient");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var patients = await response.Content.ReadFromJsonAsync<List<PatientDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            patients.Should().NotBeNull();
            patients.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetPatient_WhenIdExists_ReturnsOkAndPatient()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededPatient = await TestDataSeeder.SeedPatientAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Patient/{seededPatient.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var patient = await response.Content.ReadFromJsonAsync<PatientDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            patient.Should().NotBeNull();
            patient!.id.Should().Be(seededPatient.id);
        }

        [Fact]
        public async Task GetPatient_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Patient/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreatePatient_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            var personDto = new PersonDTO
            {
                first_name = "John",
                last_name = "Doe",
                email = $"test-{Guid.NewGuid()}@example.com",
                phone_number = "111-222-3333",
                address = "1 Test Lane",
                a_identifier = "A-ID-123"
            };
            
            var patientDto = new PatientDTO
            {
                person = personDto,
                emergency_contact_name = "Jane Doe",
                emergency_contact_phone = "444-555-6666"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Patient", JsonSnakeCaseSerializer.From(patientDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdPatient = await response.Content.ReadFromJsonAsync<PatientDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdPatient.Should().NotBeNull();
            createdPatient!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
            response.Headers.Location!.ToString().Should().Contain(createdPatient.id.ToString()!);
        }

        [Fact]
        public async Task UpdatePatient_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededPatient = await TestDataSeeder.SeedPatientAsync(context);

            var updateDto = new PatientDTO
            {
                id = seededPatient.id,
                person_id = seededPatient.person_id,
                person = new PersonDTO
                {
                    id = seededPatient.Person.id,
                    first_name = "UpdatedFirstName", // Updated value
                    last_name = seededPatient.Person.last_name,
                    email = seededPatient.Person.email,
                    phone_number = seededPatient.Person.phone_number,
                    address = seededPatient.Person.address,
                    a_identifier = seededPatient.Person.a_identifier
                },
                emergency_contact_name = "UpdatedEmergencyContact" // Updated value
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Patient/{seededPatient.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedPatient = await response.Content.ReadFromJsonAsync<PatientDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedPatient.Should().NotBeNull();
            updatedPatient!.emergency_contact_name.Should().Be("UpdatedEmergencyContact");
        }

        [Fact]
        public async Task DeletePatient_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededPatient = await TestDataSeeder.SeedPatientAsync(context);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Patient/{seededPatient.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Patient/{seededPatient.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeletePatient_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Patient/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
