using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;
using ClinicApi.Tests.Fixtures;
using ClinicApi.Tests.Utilities;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ClinicApi.Tests.Integration
{
    public class BillingApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public BillingApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetBillings_WhenBillingsExist_ReturnsOkAndListOfBillings()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            await TestDataSeeder.SeedBillingAsync(context, patient.id);
            await TestDataSeeder.SeedBillingAsync(context, patient.id);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Billing");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var billings = await response.Content.ReadFromJsonAsync<List<BillingDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            billings.Should().NotBeNull();
            billings.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetBilling_WhenIdExists_ReturnsOkAndBilling()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            var seededBilling = await TestDataSeeder.SeedBillingAsync(context, patient.id);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Billing/{seededBilling.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var billing = await response.Content.ReadFromJsonAsync<BillingDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            billing.Should().NotBeNull();
            billing!.id.Should().Be(seededBilling.id);
        }

        [Fact]
        public async Task CreateBilling_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);

            var billingDto = new BillingDTO
            {
                patient_id = patient.id,
                issue_date = DateTime.UtcNow,
                due_date = DateTime.UtcNow.AddDays(30),
                total_amount = 250,
                amount_paid = 100,
                status = BillStatusEnum.Partial
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Billing", JsonSnakeCaseSerializer.From(billingDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdBilling = await response.Content.ReadFromJsonAsync<BillingDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdBilling.Should().NotBeNull();
            createdBilling!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
            response.Headers.Location!.ToString().Should().Contain(createdBilling.id.ToString()!);
        }

        [Fact]
        public async Task DeleteBilling_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var patient = await TestDataSeeder.SeedPatientAsync(context);
            var seededBilling = await TestDataSeeder.SeedBillingAsync(context, patient.id);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Billing/{seededBilling.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Billing/{seededBilling.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
        
    }
}
