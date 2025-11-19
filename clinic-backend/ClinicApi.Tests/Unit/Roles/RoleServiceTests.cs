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

namespace ClinicApi.Tests.Unit.Roles
{
    public class RoleServiceTests
    {
        private readonly Mock<IRepository<Role>> _mockRoleRepo;
        private readonly IRoleService _sut; // System Under Test

        public RoleServiceTests()
        {
            _mockRoleRepo = new Mock<IRepository<Role>>();
            _sut = new RoleService(_mockRoleRepo.Object);
        }

        // Helper to create a valid Role entity for tests.
        private Role CreateTestRole(Guid id)
        {
            return new Role
            {
                id = id,
                name = "Test Role",
                description = "A role for testing",
                staff = new List<ClinicApi.Models.Entities.Staff>() // Initialize required collection
            };
        }

        [Fact]
        public async Task GetAllRolesAsync_WhenRolesExist_ShouldReturnRoleDtos()
        {
            // Arrange
            var roles = new List<Role>
            {
                CreateTestRole(Guid.NewGuid()),
                CreateTestRole(Guid.NewGuid())
            };
            _mockRoleRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(roles);

            // Act
            var result = await _sut.GetAllRolesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetRoleByIdAsync_WhenRoleExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var role = CreateTestRole(Guid.NewGuid());
            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(role.id)).ReturnsAsync(role);

            // Act
            var result = await _sut.GetRoleByIdAsync(role.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(role.id);
            result.name.Should().Be(role.name);
        }

        [Fact]
        public async Task GetRoleByIdAsync_WhenRoleDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Role)null);

            // Act
            var result = await _sut.GetRoleByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateRoleAsync_WithValidData_ShouldCreateAndReturnDto()
        {
            // Arrange
            var roleDto = new RoleDTO { name = "New Role", description = "New Desc" };

            // Act
            var result = await _sut.CreateRoleAsync(roleDto);

            // Assert
            result.Should().NotBeNull();
            result.name.Should().Be("New Role");
            _mockRoleRepo.Verify(repo => repo.AddAsync(It.Is<Role>(r => r.name == roleDto.name)), Times.Once);
            _mockRoleRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateRoleAsync_WhenRoleNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var roleId = Guid.NewGuid();
            var roleDto = new RoleDTO { name = "Updated Role" };
            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(roleId)).ReturnsAsync((Role)null);

            // Act
            Func<Task> act = () => _sut.UpdateRoleAsync(roleId, roleDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Role not found");
        }
        
        [Fact]
        public async Task UpdateRoleAsync_WhenRoleExists_ShouldUpdateAndReturnDto()
        {
            // Arrange
            var roleId = Guid.NewGuid();
            var existingRole = CreateTestRole(roleId);
            var roleDto = new RoleDTO { name = "Updated Name", description = "Updated Desc" };

            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(roleId)).ReturnsAsync(existingRole);
            
            // Act
            var result = await _sut.UpdateRoleAsync(roleId, roleDto);

            // Assert
            result.Should().NotBeNull();
            result.name.Should().Be("Updated Name");
            _mockRoleRepo.Verify(repo => repo.Update(It.Is<Role>(r => r.id == roleId && r.name == "Updated Name")), Times.Once);
            _mockRoleRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteRoleAsync_WhenRoleExists_ShouldReturnTrue()
        {
            // Arrange
            var role = CreateTestRole(Guid.NewGuid());
            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(role.id)).ReturnsAsync(role);

            // Act
            var result = await _sut.DeleteRoleAsync(role.id);

            // Assert
            result.Should().BeTrue();
            _mockRoleRepo.Verify(repo => repo.Delete(role), Times.Once);
            _mockRoleRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task DeleteRoleAsync_WhenRoleDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockRoleRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Role)null);
            
            // Act
            var result = await _sut.DeleteRoleAsync(Guid.NewGuid());

            // Assert
            result.Should().BeFalse();
        }
    }
}
