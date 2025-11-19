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

namespace ClinicApi.Tests.Unit.Teeth
{
    public class ToothServiceTests
    {
        private readonly Mock<IRepository<Tooth>> _mockToothRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<ToothStatus>> _mockToothStatusRepo;
        private readonly IToothService _sut;

        public ToothServiceTests()
        {
            _mockToothRepo = new Mock<IRepository<Tooth>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockToothStatusRepo = new Mock<IRepository<ToothStatus>>();

            _sut = new ToothService(
                _mockToothRepo.Object,
                _mockPatientRepo.Object,
                _mockToothStatusRepo.Object
            );
        }

        private Tooth CreateTestTooth(Guid id)
        {
             var person = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
             var patient = new Patient 
             { 
                 id = Guid.NewGuid(),
                 Person = person, 
                 appointments = new List<Appointment>(), 
                 treatments = new List<Treatment>(), 
                 billings = new List<Billing>(), 
                 teeth = new List<Tooth>(), 
                 documents = new List<Document>(), 
                 sale_items = new List<SaleItem>() 
             };

            return new Tooth
            {
                id = id,
                patient_id = patient.id,
                tooth_number = 1,
                tooth_name = "Upper Right Molar",
                tooth_status_id = Guid.NewGuid(),
                patient = patient,
                tooth_status = new ToothStatus { code = "HEALTHY", teeth = new List<Tooth>() }
            };
        }
        
        [Fact]
        public async Task GetAllTeethAsync_WhenTeethExist_ShouldReturnDtos()
        {
            // Arrange
            var teeth = new List<Tooth> { CreateTestTooth(Guid.NewGuid()), CreateTestTooth(Guid.NewGuid()) };
            _mockToothRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(teeth);

            // Act
            var result = await _sut.GetAllTeethAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetToothByIdAsync_WhenToothExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var tooth = CreateTestTooth(Guid.NewGuid());
            _mockToothRepo.Setup(repo => repo.GetByIdAsync(tooth.id)).ReturnsAsync(tooth);

            // Act
            var result = await _sut.GetToothByIdAsync(tooth.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(tooth.id);
        }
        
        [Fact]
        public async Task CreateToothAsync_WithInvalidPatientId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new ToothDTO { patient_id = Guid.NewGuid(), tooth_status_id = Guid.NewGuid(), tooth_name = "T", tooth_number = 1 };
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(dto.patient_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateToothAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Patient not found");
        }

        [Fact]
        public async Task UpdateToothAsync_WhenToothNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new ToothDTO { patient_id = Guid.NewGuid(), tooth_status_id = Guid.NewGuid(), tooth_name = "T", tooth_number = 1 };
            _mockToothRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Tooth)null);
            
            // Act
            Func<Task> act = () => _sut.UpdateToothAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Tooth not found");
        }
        
        [Fact]
        public async Task UpdateToothAsync_WhenToothExists_ShouldUpdateAndReturnDto()
        {
            // Arrange
            var toothId = Guid.NewGuid();
            var existingTooth = CreateTestTooth(toothId);
            var dto = new ToothDTO { patient_id = existingTooth.patient_id, tooth_status_id = Guid.NewGuid(), tooth_name = "Updated Tooth", tooth_number = 2 };

            _mockToothRepo.Setup(repo => repo.GetByIdAsync(toothId)).ReturnsAsync(existingTooth);
            _mockPatientRepo.Setup(repo => repo.ExistsAsync(dto.patient_id)).ReturnsAsync(true);
            _mockToothStatusRepo.Setup(repo => repo.ExistsAsync(dto.tooth_status_id)).ReturnsAsync(true);

            // Act
            var result = await _sut.UpdateToothAsync(toothId, dto);
            
            // Assert
            result.Should().NotBeNull();
            result.tooth_name.Should().Be("Updated Tooth");
            _mockToothRepo.Verify(r => r.Update(It.Is<Tooth>(t => t.id == toothId)), Times.Once);
            _mockToothRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteToothAsync_WhenToothExists_ShouldReturnTrue()
        {
            // Arrange
            var tooth = CreateTestTooth(Guid.NewGuid());
            _mockToothRepo.Setup(repo => repo.GetByIdAsync(tooth.id)).ReturnsAsync(tooth);

            // Act
            var result = await _sut.DeleteToothAsync(tooth.id);

            // Assert
            result.Should().BeTrue();
            _mockToothRepo.Verify(r => r.Delete(tooth), Times.Once);
            _mockToothRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        
        [Fact]
        public async Task DeleteToothAsync_WhenToothDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockToothRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Tooth)null);

            // Act
            var result = await _sut.DeleteToothAsync(Guid.NewGuid());
            
            // Assert
            result.Should().BeFalse();
        }
    }
}

