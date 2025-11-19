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

namespace ClinicApi.Tests.Unit.Services
{
    public class ServiceServiceTests
    {
        private readonly Mock<IRepository<Service>> _mockServiceRepo;
        private readonly Mock<IRepository<Specialty>> _mockSpecialtyRepo;
        private readonly IServiceService _sut;

        public ServiceServiceTests()
        {
            _mockServiceRepo = new Mock<IRepository<Service>>();
            _mockSpecialtyRepo = new Mock<IRepository<Specialty>>();

            _sut = new ServiceService(
                _mockServiceRepo.Object,
                _mockSpecialtyRepo.Object
            );
        }

        private Service CreateTestService(Guid id)
        {
            return new Service
            {
                id = id,
                name = "Test Service",
                cost = 100,
                specialty = new Specialty { staff = new List<ClinicApi.Models.Entities.Staff>(), services = new List<Service>() },
                treatments = new List<Treatment>()
            };
        }
        
        [Fact]
        public async Task GetAllServicesAsync_WhenServicesExist_ShouldReturnDtos()
        {
            // Arrange
            var services = new List<Service> { CreateTestService(Guid.NewGuid()), CreateTestService(Guid.NewGuid()) };
            _mockServiceRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            // Act
            var result = await _sut.GetAllServicesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetServiceByIdAsync_WhenServiceExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var service = CreateTestService(Guid.NewGuid());
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(service.id)).ReturnsAsync(service);

            // Act
            var result = await _sut.GetServiceByIdAsync(service.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(service.id);
        }
        
        [Fact]
        public async Task GetServiceByIdAsync_WhenServiceDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Service)null);

            // Act
            var result = await _sut.GetServiceByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateServiceAsync_WithValidData_ShouldCreateAndReturnDto()
        {
            // Arrange
            var dto = new ServiceDTO { name = "New Service", cost = 150 };

            // Act
            var result = await _sut.CreateServiceAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.name.Should().Be("New Service");
            _mockServiceRepo.Verify(r => r.AddAsync(It.IsAny<Service>()), Times.Once);
            _mockServiceRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateServiceAsync_WithInvalidSpecialtyId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new ServiceDTO { specialty_id = Guid.NewGuid(), name = "Test Service", cost = 100 };
            _mockSpecialtyRepo.Setup(repo => repo.ExistsAsync(dto.specialty_id.Value)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateServiceAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Specialty not found");
        }

        [Fact]
        public async Task UpdateServiceAsync_WhenServiceNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new ServiceDTO { name = "Test", cost = 1 };
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Service)null);

            // Act
            Func<Task> act = () => _sut.UpdateServiceAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Service not found");
        }

        [Fact]
        public async Task UpdateServiceAsync_WhenServiceExists_ShouldUpdateAndReturnDto()
        {
            // Arrange
            var serviceId = Guid.NewGuid();
            var existingService = CreateTestService(serviceId);
            var dto = new ServiceDTO { name = "Updated Service", cost = 200 };
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(serviceId)).ReturnsAsync(existingService);

            // Act
            var result = await _sut.UpdateServiceAsync(serviceId, dto);

            // Assert
            result.Should().NotBeNull();
            result.cost.Should().Be(200);
            _mockServiceRepo.Verify(r => r.Update(It.Is<Service>(s => s.id == serviceId)), Times.Once);
            _mockServiceRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task DeleteServiceAsync_WhenServiceExists_ShouldReturnTrue()
        {
            // Arrange
            var service = CreateTestService(Guid.NewGuid());
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(service.id)).ReturnsAsync(service);

            // Act
            var result = await _sut.DeleteServiceAsync(service.id);

            // Assert
            result.Should().BeTrue();
            _mockServiceRepo.Verify(r => r.Delete(service), Times.Once);
            _mockServiceRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteServiceAsync_WhenServiceDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockServiceRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Service)null);

            // Act
            var result = await _sut.DeleteServiceAsync(Guid.NewGuid());
            
            // Assert
            result.Should().BeFalse();
        }
    }
}

