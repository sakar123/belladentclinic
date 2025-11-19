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

// Namespace is based on your project structure.
namespace ClinicApi.Tests.Unit.Billings
{
    public class BillingServiceTests
    {
        private readonly Mock<IRepository<Billing>> _mockBillingRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly IBillingService _sut; // System Under Test

        public BillingServiceTests()
        {
            _mockBillingRepo = new Mock<IRepository<Billing>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();

            // Initializing the service with its actual dependencies from your code.
            _sut = new BillingService(
                _mockBillingRepo.Object,
                _mockPatientRepo.Object
            );
        }

        // Helper method to create a valid Billing entity for tests, satisfying 'required' properties.
        private Billing CreateTestBilling(Guid id)
        {
            var person = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
            return new Billing
            {
                id = id,
                patient_id = Guid.NewGuid(),
                due_date = DateTime.UtcNow.AddDays(30),
                patient = new Patient 
                { 
                    Person = person,
                    // Initialize all required collections for the Patient entity
                    appointments = new List<Appointment>(),
                    treatments = new List<Treatment>(),
                    billings = new List<Billing>(),
                    teeth = new List<Tooth>(),
                    documents = new List<Document>(),
                    sale_items = new List<SaleItem>()
                },
                billing_line_Item = new List<BillingLineItem>(),
                payment = new List<Payment>()
            };
        }

        [Fact]
        public async Task GetAllBillingsAsync_WhenBillingsExist_ShouldReturnBillingDtos()
        {
            // Arrange
            var billings = new List<Billing>
            {
                CreateTestBilling(Guid.NewGuid()),
                CreateTestBilling(Guid.NewGuid())
            };
            _mockBillingRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(billings);

            // Act
            var result = await _sut.GetAllBillingsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.All(dto => dto is BillingDTO).Should().BeTrue();
        }
        
        [Fact]
        public async Task GetBillingByIdAsync_WhenBillingExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var billing = CreateTestBilling(Guid.NewGuid());
            _mockBillingRepo.Setup(repo => repo.GetByIdAsync(billing.id)).ReturnsAsync(billing);

            // Act
            var result = await _sut.GetBillingByIdAsync(billing.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(billing.id);
        }

        [Fact]
        public async Task GetBillingByIdAsync_WhenBillingDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockBillingRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Billing)null);

            // Act
            var result = await _sut.GetBillingByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }
        
        [Fact]
        public async Task CreateBillingAsync_WithValidData_ShouldCreateAndReturnBillingDto()
        {
            // Arrange
            var billingDto = new BillingDTO { patient_id = Guid.NewGuid(), due_date = DateTime.UtcNow.AddDays(15) };
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(billingDto.patient_id)).ReturnsAsync(true);

            // Act
            var result = await _sut.CreateBillingAsync(billingDto);

            // Assert
            result.Should().NotBeNull();
            result.patient_id.Should().Be(billingDto.patient_id);
            _mockBillingRepo.Verify(repo => repo.AddAsync(It.IsAny<Billing>()), Times.Once);
            _mockBillingRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateBillingAsync_WithInvalidPatientId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var billingDto = new BillingDTO { patient_id = Guid.NewGuid() };
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(billingDto.patient_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateBillingAsync(billingDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Patient not found");
        }

        [Fact]
        public async Task UpdateBillingAsync_WhenBillingNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var billingId = Guid.NewGuid();
            var billingDto = new BillingDTO { patient_id = Guid.NewGuid() };
            _mockBillingRepo.Setup(repo => repo.GetByIdAsync(billingId)).ReturnsAsync((Billing)null);

            // Act
            Func<Task> act = () => _sut.UpdateBillingAsync(billingId, billingDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Billing not found");
        }
        
        [Fact]
        public async Task DeleteBillingAsync_WhenBillingExists_ShouldReturnTrue()
        {
            // Arrange
            var billing = CreateTestBilling(Guid.NewGuid());
            _mockBillingRepo.Setup(repo => repo.GetByIdAsync(billing.id)).ReturnsAsync(billing);

            // Act
            var result = await _sut.DeleteBillingAsync(billing.id);

            // Assert
            result.Should().BeTrue();
            _mockBillingRepo.Verify(repo => repo.Delete(billing), Times.Once);
            _mockBillingRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteBillingAsync_WhenBillingDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            var billingId = Guid.NewGuid();
            _mockBillingRepo.Setup(repo => repo.GetByIdAsync(billingId)).ReturnsAsync((Billing)null);
            
            // Act
            var result = await _sut.DeleteBillingAsync(billingId);
            
            // Assert
            result.Should().BeFalse();
            _mockBillingRepo.Verify(repo => repo.Delete(It.IsAny<Billing>()), Times.Never);
        }
    }
}
