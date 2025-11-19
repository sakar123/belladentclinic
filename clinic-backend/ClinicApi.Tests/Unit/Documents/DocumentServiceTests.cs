using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;
using FluentAssertions;
using Moq;
using Xunit;

namespace ClinicApi.Tests.Unit.Documents
{
    public class DocumentServiceTests
    {
        private readonly Mock<IRepository<Document>> _mockDocumentRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<DocumentType>> _mockDocTypeRepo;
        private readonly Mock<IRepository<Tooth>> _mockToothRepo;
        private readonly Mock<IRepository<Treatment>> _mockTreatmentRepo;
        private readonly IDocumentService _sut;

        public DocumentServiceTests()
        {
            _mockDocumentRepo = new Mock<IRepository<Document>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockDocTypeRepo = new Mock<IRepository<DocumentType>>();
            _mockToothRepo = new Mock<IRepository<Tooth>>();
            _mockTreatmentRepo = new Mock<IRepository<Treatment>>();

            _sut = new DocumentService(
                _mockDocumentRepo.Object,
                _mockPatientRepo.Object,
                _mockDocTypeRepo.Object,
                _mockToothRepo.Object,
                _mockTreatmentRepo.Object
            );
        }

        private Document CreateTestDocument(Guid id)
        {
            var person = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
            var patient = new Patient { Person = person, appointments = new List<Appointment>(), treatments = new List<Treatment>(), billings = new List<Billing>(), teeth = new List<Tooth>(), documents = new List<Document>(), sale_items = new List<SaleItem>() };
            
            return new Document
            {
                id = id,
                patient_id = Guid.NewGuid(),
                document_type_id = Guid.NewGuid(),
                description = "Test X-Ray",
                document_path = "/path/to/doc.jpg",
                patient = patient,
                document_type = new DocumentType { documents = new List<Document>() }
            };
        }

        [Fact]
        public async Task GetAllDocumentsAsync_WhenDocumentsExist_ShouldReturnDocumentDtos()
        {
            // Arrange
            var documents = new List<Document>
            {
                CreateTestDocument(Guid.NewGuid()),
                CreateTestDocument(Guid.NewGuid())
            };
            _mockDocumentRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(documents);

            // Act
            var result = await _sut.GetAllDocumentsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }
        
        [Fact]
        public async Task GetDocumentByIdAsync_WhenDocumentExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var document = CreateTestDocument(Guid.NewGuid());
            _mockDocumentRepo.Setup(repo => repo.GetByIdAsync(document.id)).ReturnsAsync(document);

            // Act
            var result = await _sut.GetDocumentByIdAsync(document.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(document.id);
        }

        [Fact]
        public async Task CreateDocumentAsync_WithValidData_ShouldCreateAndReturnDocumentDto()
        {
            // Arrange
            var docDto = new DocumentDTO
            {
                patient_id = Guid.NewGuid(),
                document_type_id = Guid.NewGuid(),
                tooth_id = Guid.NewGuid(),
                treatment_id = Guid.NewGuid(),
                description = "New X-Ray",
                document_path = "/path/new.jpg"
            };

            _mockPatientRepo.Setup(repo => repo.ExistsAsync(docDto.patient_id)).ReturnsAsync(true);
            _mockDocTypeRepo.Setup(repo => repo.ExistsAsync(docDto.document_type_id)).ReturnsAsync(true);
            _mockToothRepo.Setup(repo => repo.ExistsAsync(docDto.tooth_id.Value)).ReturnsAsync(true);
            _mockTreatmentRepo.Setup(repo => repo.ExistsAsync(docDto.treatment_id.Value)).ReturnsAsync(true);

            // Act
            var result = await _sut.CreateDocumentAsync(docDto);

            // Assert
            result.Should().NotBeNull();
            result.patient_id.Should().Be(docDto.patient_id);
            _mockDocumentRepo.Verify(repo => repo.AddAsync(It.IsAny<Document>()), Times.Once);
            _mockDocumentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task CreateDocumentAsync_WithInvalidPatientId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var docDto = new DocumentDTO { patient_id = Guid.NewGuid(), document_type_id = Guid.NewGuid(), description = "d", document_path = "p" };
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(docDto.patient_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateDocumentAsync(docDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Patient not found");
        }

        [Fact]
        public async Task UpdateDocumentAsync_WhenDocumentNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var docId = Guid.NewGuid();
            var docDto = new DocumentDTO { patient_id = Guid.NewGuid(), document_type_id = Guid.NewGuid(), description = "d", document_path = "p" };
            _mockDocumentRepo.Setup(repo => repo.GetByIdAsync(docId)).ReturnsAsync((Document)null);
            
            // Act
            Func<Task> act = () => _sut.UpdateDocumentAsync(docId, docDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Document not found");
        }

        [Fact]
        public async Task DeleteDocumentAsync_WhenDocumentExists_ShouldReturnTrue()
        {
            // Arrange
            var document = CreateTestDocument(Guid.NewGuid());
            _mockDocumentRepo.Setup(repo => repo.GetByIdAsync(document.id)).ReturnsAsync(document);

            // Act
            var result = await _sut.DeleteDocumentAsync(document.id);

            // Assert
            result.Should().BeTrue();
            _mockDocumentRepo.Verify(repo => repo.Delete(document), Times.Once);
            _mockDocumentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }
    }
}
