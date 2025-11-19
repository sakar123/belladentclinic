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

// Namespace is ...StaffTests to avoid conflict with the 'Staff' entity name.
namespace ClinicApi.Tests.Unit.StaffTests
{
    public class StaffServiceTests
    {
        private readonly Mock<IRepository<Staff>> _mockStaffRepo;
        private readonly Mock<IRepository<Person>> _mockPersonRepo;
        private readonly Mock<IRepository<Role>> _mockRoleRepo;
        private readonly Mock<IRepository<Specialty>> _mockSpecialtyRepo;
        private readonly IStaffService _sut; // System Under Test

        public StaffServiceTests()
        {
            _mockStaffRepo = new Mock<IRepository<Staff>>();
            _mockPersonRepo = new Mock<IRepository<Person>>();
            _mockRoleRepo = new Mock<IRepository<Role>>();
            _mockSpecialtyRepo = new Mock<IRepository<Specialty>>();

            _sut = new StaffService(
                _mockStaffRepo.Object,
                _mockPersonRepo.Object,
                _mockRoleRepo.Object,
                _mockSpecialtyRepo.Object
            );
        }

        private Staff CreateTestStaff(Guid id)
        {
            var person = new Person 
            { 
                id = Guid.NewGuid(),
                first_name = "Test", last_name = "Doctor", email = "d@test.com", 
                phone_number = "1", address = "1", a_identifier = "1" 
            };

            return new Staff
            {
                id = id,
                person_id = person.id,
                role_id = Guid.NewGuid(),
                license_number = "LIC123",
                person = person,
                role = new Role { staff = new List<Staff>(), name = "Dentist" },
                specialty = new Specialty { name = "General" },
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>()
            };
        }
        
        [Fact]
        public async Task GetAllStaffAsync_WhenStaffExist_ShouldReturnDtos()
        {
            // Arrange
            var staffList = new List<Staff> { CreateTestStaff(Guid.NewGuid()), CreateTestStaff(Guid.NewGuid()) };
            _mockStaffRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(staffList);

            // Act
            var result = await _sut.GetAllStaffAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetStaffByIdAsync_WhenStaffExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var staff = CreateTestStaff(Guid.NewGuid());
            _mockStaffRepo.Setup(repo => repo.GetByIdAsync(staff.id)).ReturnsAsync(staff);

            // Act
            var result = await _sut.GetStaffByIdAsync(staff.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(staff.id);
        }
        
        [Fact]
        public async Task GetStaffByIdAsync_WhenStaffDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockStaffRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Staff)null);

            // Act
            var result = await _sut.GetStaffByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateStaffAsync_WithInvalidRoleId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new StaffDTO { role_id = Guid.NewGuid(), license_number = "123", person = new PersonDTO { a_identifier = "1", email="t@t.com", first_name = "f", last_name = "l", phone_number = "1", address="1" } };
            _mockRoleRepo.Setup(repo => repo.ExistsAsync(dto.role_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateStaffAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Role not found");
        }

        [Fact]
        public async Task UpdateStaffAsync_WhenStaffNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new StaffDTO { role_id = Guid.NewGuid(), license_number = "123", person = new PersonDTO { a_identifier = "1", email="t@t.com", first_name = "f", last_name = "l", phone_number = "1", address="1" } };
            _mockStaffRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Staff)null);

            // Act
            Func<Task> act = () => _sut.UpdateStaffAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Staff not found");
        }

        [Fact]
        public async Task DeleteStaffAsync_WhenStaffExists_ShouldReturnTrue()
        {
            // Arrange
            var staff = CreateTestStaff(Guid.NewGuid());
            _mockStaffRepo.Setup(repo => repo.GetByIdAsync(staff.id)).ReturnsAsync(staff);
            _mockPersonRepo.Setup(repo => repo.GetByIdAsync(staff.person_id)).ReturnsAsync(staff.person);

            // Act
            var result = await _sut.DeleteStaffAsync(staff.id);

            // Assert
            result.Should().BeTrue();
            //_mockStaffRepo.Verify(r => r.Delete(staff), Times.Once);
            _mockPersonRepo.Verify(r => r.Delete(staff.person), Times.Once);
            //_mockStaffRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
            _mockPersonRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task DeleteStaffAsync_WhenStaffDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockStaffRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Staff)null);

            // Act
            var result = await _sut.DeleteStaffAsync(Guid.NewGuid());
            
            // Assert
            result.Should().BeFalse();
        }
    }
}

