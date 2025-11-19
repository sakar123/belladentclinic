using System.Net;
using System.Net.Http.Json;
using ClinicApi.Models.DTOs;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ClinicApi.Tests.Integration
{
    public class AppointmentApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public AppointmentApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetAppointments_WhenAppointmentsExist_ReturnsOkAndListOfAppointments()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, staff, status) = await TestDataSeeder.SeedBasicAppointmentDependenciesAsync(context);
            await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);
            await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Appointment");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var appointments = await response.Content.ReadFromJsonAsync<List<AppointmentDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            appointments.Should().NotBeNull();
            appointments.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetAppointment_WhenIdExists_ReturnsOkAndAppointment()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, staff, status) = await TestDataSeeder.SeedBasicAppointmentDependenciesAsync(context);
            var seededAppointment = await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Appointment/{seededAppointment.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var appointment = await response.Content.ReadFromJsonAsync<AppointmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            appointment.Should().NotBeNull();
            appointment!.id.Should().Be(seededAppointment.id);
        }

        [Fact]
        public async Task GetAppointment_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Appointment/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateAppointment_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, staff, status) = await TestDataSeeder.SeedBasicAppointmentDependenciesAsync(context);
            
            var appointmentDto = new AppointmentDTO
            {
                patient_id = patient.id,
                staff_id = staff.id,
                status_id = status.id,
                appointment_start_time = DateTime.UtcNow.AddDays(5),
                duration_minutes = 45,
                reason_for_visit = "Integration Test"
            };

            var checker = JsonSnakeCaseSerializer.From(appointmentDto);
            // Act
            var response = await _fixture.Client.PostAsync("/api/Appointment", JsonSnakeCaseSerializer.From(appointmentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdAppointment = await response.Content.ReadFromJsonAsync<AppointmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdAppointment.Should().NotBeNull();
            createdAppointment!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
            response.Headers.Location!.ToString().Should().Contain(createdAppointment.id.ToString()!);
        }

        [Fact]
        public async Task CreateAppointment_WithInvalidPatientId_ReturnsBadRequest()
        {
            // Arrange
             var appointmentDto = new AppointmentDTO
            {
                patient_id = Guid.NewGuid(), // Non-existent Patient ID
                staff_id = Guid.NewGuid(),
                status_id = Guid.NewGuid(),
                appointment_start_time = DateTime.UtcNow.AddDays(5),
                duration_minutes = 45,
                reason_for_visit = "Integration Test"
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Appointment", JsonSnakeCaseSerializer.From(appointmentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateAppointment_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, staff, status) = await TestDataSeeder.SeedBasicAppointmentDependenciesAsync(context);
            var seededAppointment = await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);

            var updateDto = new AppointmentDTO
            {
                id = seededAppointment.id,
                patient_id = patient.id,
                staff_id = staff.id,
                status_id = status.id,
                appointment_start_time = seededAppointment.appointment_start_time,
                duration_minutes = 90, // Updated value
                reason_for_visit = "Updated Reason" // Updated value
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Appointment/{seededAppointment.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedAppointment = await response.Content.ReadFromJsonAsync<AppointmentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedAppointment.Should().NotBeNull();
            updatedAppointment!.duration_minutes.Should().Be(90);
            updatedAppointment.reason_for_visit.Should().Be("Updated Reason");
        }

        [Fact]
        public async Task DeleteAppointment_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, staff, status) = await TestDataSeeder.SeedBasicAppointmentDependenciesAsync(context);
            var seededAppointment = await TestDataSeeder.SeedAppointmentAsync(context, patient.id, staff.id, status.id);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Appointment/{seededAppointment.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Appointment/{seededAppointment.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteAppointment_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Appointment/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
