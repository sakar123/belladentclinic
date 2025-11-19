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

namespace ClinicApi.Tests.Unit.Patients
{
    public class PatientServiceTests
    {
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<Person>> _mockPersonRepo;
        private readonly IPatientService _sut; // System Under Test

        public PatientServiceTests()
        {
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockPersonRepo = new Mock<IRepository<Person>>();

            _sut = new PatientService(
                _mockPatientRepo.Object,
                _mockPersonRepo.Object
            );
        }

        // Helper method to create a valid Patient entity for tests.
        private Patient CreateTestPatient(Guid id)
        {
            var person = new Person 
            { 
                id = Guid.NewGuid(),
                first_name = "Test", 
                last_name = "Patient", 
                email = "p@test.com", 
                phone_number = "1", 
                address = "1", 
                a_identifier = "1" 
            };

            return new Patient
            {
                id = id,
                person_id = person.id,
                Person = person,
                // Initialize all required collections
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>(),
                billings = new List<Billing>(),
                teeth = new List<Tooth>(),
                documents = new List<Document>(),
                sale_items = new List<SaleItem>()
            };
        }

        [Fact]
        public async Task GetAllPatientsAsync_WhenPatientsExist_ShouldReturnPatientDtos()
        {
            // Arrange
            var patients = new List<Patient>
            {
                CreateTestPatient(Guid.NewGuid()),
                CreateTestPatient(Guid.NewGuid())
            };
            _mockPatientRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(patients);

            // Act
            var result = await _sut.GetAllPatientsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetPatientByIdAsync_WhenPatientExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var patient = CreateTestPatient(Guid.NewGuid());
            _mockPatientRepo.Setup(repo => repo.GetByIdAsync(patient.id)).ReturnsAsync(patient);

            // Act
            var result = await _sut.GetPatientByIdAsync(patient.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(patient.id);
            result.person_id.Should().Be(patient.person_id);
        }
        
        [Fact]
        public async Task CreatePatientAsync_WithValidData_ShouldCreatePersonAndPatientAndReturnDto()
        {
            // Arrange
            var personDto = new PersonDTO { first_name = "New", last_name = "Person", email="n@p.com", phone_number = "1", address="1", a_identifier="1" };
            var patientDto = new PatientDTO { person = personDto };
            
            // Act
            var result = await _sut.CreatePatientAsync(patientDto);

            // Assert
            result.Should().NotBeNull();
            _mockPersonRepo.Verify(repo => repo.AddAsync(It.IsAny<Person>()), Times.Once);
            _mockPersonRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
            _mockPatientRepo.Verify(repo => repo.AddAsync(It.IsAny<Patient>()), Times.Once);
            _mockPatientRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdatePatientAsync_WhenPatientNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var patientId = Guid.NewGuid();
            var patientDto = new PatientDTO { person = new PersonDTO() };
            _mockPatientRepo.Setup(repo => repo.GetByIdAsync(patientId)).ReturnsAsync((Patient)null);

            // Act
            Func<Task> act = () => _sut.UpdatePatientAsync(patientId, patientDto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Patient not found");
        }

        [Fact]
    public async Task DeletePatientAsync_WhenPatientExists_ShouldDeletePatientAndPersonAndReturnTrue()
    {
        // Arrange
        var patient = CreateTestPatient(Guid.NewGuid());
        _mockPatientRepo.Setup(repo => repo.GetByIdAsync(patient.id)).ReturnsAsync(patient);
        _mockPersonRepo.Setup(repo => repo.GetByIdAsync(patient.person_id)).ReturnsAsync(patient.Person);

        // Act
        var result = await _sut.DeletePatientAsync(patient.id);

        // Assert
        result.Should().BeTrue();
        // Verify that ONLY the person repository's delete method is called.
        _mockPersonRepo.Verify(repo => repo.Delete(patient.Person), Times.Once);
        _mockPersonRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

        [Fact]
        public async Task DeletePatientAsync_WhenPatientDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockPatientRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Patient)null);

            // Act
            var result = await _sut.DeletePatientAsync(Guid.NewGuid());

            // Assert
            result.Should().BeFalse();
            _mockPersonRepo.Verify(repo => repo.Delete(It.IsAny<Person>()), Times.Never);
        }
    }
}
