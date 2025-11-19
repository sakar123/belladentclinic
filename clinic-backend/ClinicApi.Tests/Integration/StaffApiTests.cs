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
    public class StaffApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public StaffApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetStaff_WhenStaffExist_ReturnsOkAndListOfStaff()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            await TestDataSeeder.SeedStaffAsync(context);
            await TestDataSeeder.SeedStaffAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Staff");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var staffList = await response.Content.ReadFromJsonAsync<List<StaffDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            staffList.Should().NotBeNull();
            staffList.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetStaffById_WhenIdExists_ReturnsOkAndStaffMember()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededStaff = await TestDataSeeder.SeedStaffAsync(context);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Staff/{seededStaff.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var staff = await response.Content.ReadFromJsonAsync<StaffDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            staff.Should().NotBeNull();
            staff!.id.Should().Be(seededStaff.id);
        }

        [Fact]
        public async Task GetStaffById_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Staff/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateStaff_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var role = await TestDataSeeder.SeedRoleAsync(context);
            var specialty = await TestDataSeeder.SeedSpecialtyAsync(context);

            var personDto = new PersonDTO
            {
                first_name = "Test",
                last_name = "Doctor",
                email = $"doctor-{Guid.NewGuid()}@clinic.com",
                phone_number = "555-1234",
                address = "123 Clinic Rd",
                a_identifier = "S-ID-987"
            };

            var staffDto = new StaffDTO
            {
                person = personDto,
                role_id = role.id,
                specialty_id = specialty.id,
                license_number = $"LIC-{Guid.NewGuid()}",
                is_active = true
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Staff", JsonSnakeCaseSerializer.From(staffDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdStaff = await response.Content.ReadFromJsonAsync<StaffDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdStaff.Should().NotBeNull();
            createdStaff!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateStaff_WithInvalidRoleId_ReturnsBadRequest()
        {
            // Arrange
            var personDto = new PersonDTO
            {
                first_name = "Test", last_name = "Failure", email = $"fail-{Guid.NewGuid()}@clinic.com",
                phone_number = "1", address = "1", a_identifier = "1"
            };
            var staffDto = new StaffDTO
            {
                person = personDto,
                role_id = Guid.NewGuid(), // Non-existent Role ID
                license_number = "FAIL-LIC"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Staff", JsonSnakeCaseSerializer.From(staffDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateStaff_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededStaff = await TestDataSeeder.SeedStaffAsync(context);

            var updateDto = new StaffDTO
            {
                id = seededStaff.id,
                person_id = seededStaff.person_id,
                person = new PersonDTO 
                { 
                    id = seededStaff.person.id,
                    first_name = "UpdatedFirstName", // Updated value
                    last_name = seededStaff.person.last_name,
                    email = seededStaff.person.email,
                    phone_number = seededStaff.person.phone_number,
                    address = seededStaff.person.address,
                    a_identifier = seededStaff.person.a_identifier
                },
                role_id = seededStaff.role_id,
                specialty_id = seededStaff.specialty_id,
                license_number = "LIC-UPDATED", // Updated value
                is_active = false // Updated value
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Staff/{seededStaff.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedStaff = await response.Content.ReadFromJsonAsync<StaffDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedStaff.Should().NotBeNull();
            updatedStaff!.license_number.Should().Be("LIC-UPDATED");
            updatedStaff.is_active.Should().BeFalse();
        }

        [Fact]
        public async Task DeleteStaff_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var seededStaff = await TestDataSeeder.SeedStaffAsync(context);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Staff/{seededStaff.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Staff/{seededStaff.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
