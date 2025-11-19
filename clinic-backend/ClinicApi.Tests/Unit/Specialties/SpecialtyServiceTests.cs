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

namespace ClinicApi.Tests.Unit.Specialties
{
    public class SpecialtyServiceTests
    {
        private readonly Mock<IRepository<Specialty>> _mockSpecialtyRepo;
        private readonly ISpecialtyService _sut;

        public SpecialtyServiceTests()
        {
            _mockSpecialtyRepo = new Mock<IRepository<Specialty>>();
            _sut = new SpecialtyService(_mockSpecialtyRepo.Object);
        }

        private Specialty CreateTestSpecialty(Guid id)
        {
            return new Specialty
            {
                id = id,
                name = "Test Specialty",
                staff = new List<ClinicApi.Models.Entities.Staff>(),
                services = new List<Service>()
            };
        }

        [Fact]
        public async Task GetAllSpecialtiesAsync_WhenSpecialtiesExist_ShouldReturnDtos()
        {
            // Arrange
            var specialties = new List<Specialty> { CreateTestSpecialty(Guid.NewGuid()), CreateTestSpecialty(Guid.NewGuid()) };
            _mockSpecialtyRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(specialties);
            
            // Act
            var result = await _sut.GetAllSpecialtiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }
        
        [Fact]
        public async Task GetSpecialtyByIdAsync_WhenSpecialtyExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var specialty = CreateTestSpecialty(Guid.NewGuid());
            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(specialty.id)).ReturnsAsync(specialty);

            // Act
            var result = await _sut.GetSpecialtyByIdAsync(specialty.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(specialty.id);
        }
        
        [Fact]
        public async Task GetSpecialtyByIdAsync_WhenSpecialtyDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Specialty)null);

            // Act
            var result = await _sut.GetSpecialtyByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateSpecialtyAsync_WithValidData_ShouldCreateAndReturnDto()
        {
            // Arrange
            var dto = new SpecialtyDTO { name = "Cardiology", description = "Heart stuff" };

            // Act
            var result = await _sut.CreateSpecialtyAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.name.Should().Be("Cardiology");
            _mockSpecialtyRepo.Verify(r => r.AddAsync(It.IsAny<Specialty>()), Times.Once);
            _mockSpecialtyRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateSpecialtyAsync_WhenSpecialtyNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new SpecialtyDTO { name = "Test" };
            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Specialty)null);

            // Act
            Func<Task> act = () => _sut.UpdateSpecialtyAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Specialty not found");
        }
        
        [Fact]
        public async Task UpdateSpecialtyAsync_WhenSpecialtyExists_ShouldUpdateAndReturnDto()
        {
            // Arrange
            var specialtyId = Guid.NewGuid();
            var existingSpecialty = CreateTestSpecialty(specialtyId);
            var dto = new SpecialtyDTO { name = "Updated Name", description = "Updated Desc" };

            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(specialtyId)).ReturnsAsync(existingSpecialty);

            // Act
            var result = await _sut.UpdateSpecialtyAsync(specialtyId, dto);

            // Assert
            result.Should().NotBeNull();
            result.name.Should().Be("Updated Name");
            _mockSpecialtyRepo.Verify(r => r.Update(It.Is<Specialty>(s => s.id == specialtyId)), Times.Once);
            _mockSpecialtyRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteSpecialtyAsync_WhenSpecialtyExists_ShouldReturnTrue()
        {
            // Arrange
            var specialty = CreateTestSpecialty(Guid.NewGuid());
            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(specialty.id)).ReturnsAsync(specialty);

            // Act
            var result = await _sut.DeleteSpecialtyAsync(specialty.id);

            // Assert
            result.Should().BeTrue();
            _mockSpecialtyRepo.Verify(r => r.Delete(specialty), Times.Once);
            _mockSpecialtyRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task DeleteSpecialtyAsync_WhenSpecialtyDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockSpecialtyRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Specialty)null);
            
            // Act
            var result = await _sut.DeleteSpecialtyAsync(Guid.NewGuid());

            // Assert
            result.Should().BeFalse();
        }
    }
}

