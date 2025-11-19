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
    public class DocumentApiTests : IClassFixture<ApiTestFixture>
    {
        private readonly ApiTestFixture _fixture;

        public DocumentApiTests(ApiTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact]
        public async Task GetDocuments_WhenDocumentsExist_ReturnsOkAndListOfDocuments()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, docType, _, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            await TestDataSeeder.SeedDocumentAsync(context, patient.id, docType.id);
            await TestDataSeeder.SeedDocumentAsync(context, patient.id, docType.id);

            // Act
            var response = await _fixture.Client.GetAsync("/api/Document");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var documents = await response.Content.ReadFromJsonAsync<List<DocumentDTO>>(JsonSnakeCaseSerializer.SerializerOptions);
            documents.Should().NotBeNull();
            documents.Should().HaveCountGreaterOrEqualTo(2);
        }

        [Fact]
        public async Task GetDocument_WhenIdExists_ReturnsOkAndDocument()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, docType, _, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            var seededDocument = await TestDataSeeder.SeedDocumentAsync(context, patient.id, docType.id);

            // Act
            var response = await _fixture.Client.GetAsync($"/api/Document/{seededDocument.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var document = await response.Content.ReadFromJsonAsync<DocumentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            document.Should().NotBeNull();
            document!.id.Should().Be(seededDocument.id);
        }

        [Fact]
        public async Task GetDocument_WhenIdDoesNotExist_ReturnsNotFound()
        {
            // Act
            var response = await _fixture.Client.GetAsync($"/api/Document/{Guid.NewGuid()}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateDocument_WithValidData_ReturnsCreatedAt()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, docType, tooth, treatment) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            
            var documentDto = new DocumentDTO
            {
                patient_id = patient.id,
                document_type_id = docType.id,
                tooth_id = tooth.id,
                treatment_id = treatment.id,
                description = "Integration Test X-Ray",
                document_path = "/test/path.jpg",
                upload_date = DateTime.UtcNow
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Document", JsonSnakeCaseSerializer.From(documentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var createdDocument = await response.Content.ReadFromJsonAsync<DocumentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            createdDocument.Should().NotBeNull();
            createdDocument!.id.Should().NotBeNull();
            response.Headers.Location.Should().NotBeNull();
            response.Headers.Location!.ToString().Should().Contain(createdDocument.id.ToString()!);
        }
        
        [Fact]
        public async Task CreateDocument_WithInvalidPatientId_ReturnsBadRequest()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (_, docType, _, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);

            var documentDto = new DocumentDTO
            {
                patient_id = Guid.NewGuid(), // Non-existent ID
                document_type_id = docType.id,
                description = "Test with bad patient ID",
                document_path = "/test/path.jpg",
                upload_date = DateTime.UtcNow
            };

            // Act
            var response = await _fixture.Client.PostAsync("/api/Document", JsonSnakeCaseSerializer.From(documentDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UpdateDocument_WhenIdExistsAndDataIsValid_ReturnsOk()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, docType, _, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            var seededDocument = await TestDataSeeder.SeedDocumentAsync(context, patient.id, docType.id);

            var updateDto = new DocumentDTO
            {
                id = seededDocument.id,
                patient_id = patient.id,
                document_type_id = docType.id,
                description = "Updated Description", // Updated value
                document_path = seededDocument.document_path,
                upload_date = seededDocument.upload_date
            };

            // Act
            var response = await _fixture.Client.PutAsync($"/api/Document/{seededDocument.id}", JsonSnakeCaseSerializer.From(updateDto));

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var updatedDocument = await response.Content.ReadFromJsonAsync<DocumentDTO>(JsonSnakeCaseSerializer.SerializerOptions);
            updatedDocument.Should().NotBeNull();
            updatedDocument!.description.Should().Be("Updated Description");
        }

        [Fact]
        public async Task DeleteDocument_WhenIdExists_ReturnsNoContent()
        {
            // Arrange
            await using var scope = _fixture.WebAppFactory.Services.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<Data.DentalClinicContext>();
            var (patient, docType, _, _) = await TestDataSeeder.SeedDocumentDependenciesAsync(context);
            var seededDocument = await TestDataSeeder.SeedDocumentAsync(context, patient.id, docType.id);

            // Act
            var response = await _fixture.Client.DeleteAsync($"/api/Document/{seededDocument.id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's actually gone
            var verifyResponse = await _fixture.Client.GetAsync($"/api/Document/{seededDocument.id}");
            verifyResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
