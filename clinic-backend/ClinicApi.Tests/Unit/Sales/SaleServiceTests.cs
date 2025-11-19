using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;
using FluentAssertions;
using Moq;
using Xunit;

namespace ClinicApi.Tests.Unit.Sales
{
    public class SaleServiceTests
    {
        private readonly Mock<IRepository<SaleItem>> _mockSaleItemRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<DiscountType>> _mockDiscountTypeRepo;
        private readonly ISaleService _sut;

        public SaleServiceTests()
        {
            _mockSaleItemRepo = new Mock<IRepository<SaleItem>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockDiscountTypeRepo = new Mock<IRepository<DiscountType>>();

            _sut = new SaleService(
                _mockSaleItemRepo.Object,
                _mockPatientRepo.Object,
                _mockDiscountTypeRepo.Object
            );
        }

        private SaleItem CreateTestSaleItem(Guid id)
        {
            var person = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
            return new SaleItem
            {
                id = id,
                patient_id = Guid.NewGuid(),
                discount_id = Guid.NewGuid(),
                patient = new Patient 
                { 
                    Person = person, 
                    appointments = new List<Appointment>(), 
                    treatments = new List<Treatment>(), 
                    billings = new List<Billing>(), 
                    teeth = new List<Tooth>(), 
                    documents = new List<Document>(), 
                    sale_items = new List<SaleItem>() 
                },
                discount_type = new DiscountType { discount_name = "Test Discount", sale_item = new List<SaleItem>() }
            };
        }

        [Fact]
        public async Task GetSaleItemByIdAsync_WhenItemExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var saleItem = CreateTestSaleItem(Guid.NewGuid());
            _mockSaleItemRepo.Setup(repo => repo.GetByIdAsync(saleItem.id)).ReturnsAsync(saleItem);

            // Act
            var result = await _sut.GetSaleItemByIdAsync(saleItem.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(saleItem.id);
        }
        
        [Fact]
        public async Task GetAllSaleItemsAsync_WhenItemsExist_ShouldReturnDtos()
        {
            // Arrange
            var items = new List<SaleItem> { CreateTestSaleItem(Guid.NewGuid()), CreateTestSaleItem(Guid.NewGuid()) };
            _mockSaleItemRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(items);

            // Act
            var result = await _sut.GetAllSaleItemsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task CreateSaleItemAsync_WithInvalidPatientId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new SaleItemDTO { patient_id = Guid.NewGuid(), cost = 1, quantity = 1 };
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(dto.patient_id.Value)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateSaleItemAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Patient not found");
        }
        
        [Fact]
        public async Task CreateSaleItemAsync_WithInvalidDiscountId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new SaleItemDTO { discount_id = Guid.NewGuid(), cost = 1, quantity = 1 };
             _mockDiscountTypeRepo.Setup(repo => repo.ExistsAsync(dto.discount_id.Value)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateSaleItemAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Discount type not found");
        }

        [Fact]
        public async Task UpdateSaleItemAsync_WhenItemNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new SaleItemDTO { cost = 1, quantity = 1 };
            _mockSaleItemRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((SaleItem)null);
            
            // Act
            Func<Task> act = () => _sut.UpdateSaleItemAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Sale item not found");
        }

        [Fact]
        public async Task DeleteSaleItemAsync_WhenItemExists_ShouldReturnTrue()
        {
            // Arrange
            var saleItem = CreateTestSaleItem(Guid.NewGuid());
            _mockSaleItemRepo.Setup(repo => repo.GetByIdAsync(saleItem.id)).ReturnsAsync(saleItem);

            // Act
            var result = await _sut.DeleteSaleItemAsync(saleItem.id);

            // Assert
            result.Should().BeTrue();
            _mockSaleItemRepo.Verify(r => r.Delete(saleItem), Times.Once);
            _mockSaleItemRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }
}

