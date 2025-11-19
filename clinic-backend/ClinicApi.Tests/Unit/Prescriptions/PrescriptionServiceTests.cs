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

namespace ClinicApi.Tests.Unit.Prescriptions
{
    public class PrescriptionServiceTests
    {
        private readonly Mock<IRepository<Prescription>> _mockPrescriptionRepo;
        private readonly Mock<IRepository<Treatment>> _mockTreatmentRepo;
        private readonly IPrescriptionService _sut; // System Under Test

        public PrescriptionServiceTests()
        {
            _mockPrescriptionRepo = new Mock<IRepository<Prescription>>();
            _mockTreatmentRepo = new Mock<IRepository<Treatment>>();

            _sut = new PrescriptionService(
                _mockPrescriptionRepo.Object,
                _mockTreatmentRepo.Object
            );
        }

        // Helper to create a valid Prescription entity, satisfying all 'required' properties.
        private Prescription CreateTestPrescription(Guid id)
        {
             var patientPerson = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
             var staffPerson = new Person { first_name = "Test", last_name = "Doctor", email = "d@test.com", phone_number = "1", address = "1", a_identifier = "1" };
             var patient = new Patient { Person = patientPerson, appointments = new List<Appointment>(), treatments = new List<Treatment>(), billings = new List<Billing>(), teeth = new List<Tooth>(), documents = new List<Document>(), sale_items = new List<SaleItem>() };

            var treatment = new Treatment
            {
                id = Guid.NewGuid(),
                appointment = new Appointment 
                { 
                    patient = patient,
                    staff = new ClinicApi.Models.Entities.Staff { person = staffPerson, role = new Role { staff = new List<ClinicApi.Models.Entities.Staff>(), name = "Dentist"}, specialty = new Specialty(), appointments = new List<Appointment>(), treatments = new List<Treatment>(), license_number="123" },
                    status = new AppointmentStatus { name = "Scheduled", appointments = new List<Appointment>() },
                    treatments = new List<Treatment>()
                },
                patient = patient,
                staff = new ClinicApi.Models.Entities.Staff { person = staffPerson, role = new Role { staff = new List<ClinicApi.Models.Entities.Staff>(), name = "Dentist" }, specialty = new Specialty(), appointments = new List<Appointment>(), treatments = new List<Treatment>(), license_number = "123" },
                service = new Service { specialty = new Specialty(), treatments = new List<Treatment>(), name="Whitening" },
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>(),
                Tooth = new Tooth { patient = patient, tooth_name="molar", tooth_status = new ToothStatus { teeth = new List<Tooth>() } }
            };

            return new Prescription
            {
                id = id,
                treatment_id = treatment.id,
                drug_name = "Test Drug",
                dosage = "100mg",
                treatment = treatment
            };
        }

        [Fact]
        public async Task GetAllPrescriptionsAsync_WhenPrescriptionsExist_ShouldReturnDtos()
        {
            // Arrange
            var prescriptions = new List<Prescription>
            {
                CreateTestPrescription(Guid.NewGuid()),
                CreateTestPrescription(Guid.NewGuid())
            };
            _mockPrescriptionRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(prescriptions);

            // Act
            var result = await _sut.GetAllPrescriptionsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }
        
        [Fact]
        public async Task GetPrescriptionByIdAsync_WhenPrescriptionExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var prescription = CreateTestPrescription(Guid.NewGuid());
            _mockPrescriptionRepo.Setup(repo => repo.GetByIdAsync(prescription.id)).ReturnsAsync(prescription);

            // Act
            var result = await _sut.GetPrescriptionByIdAsync(prescription.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(prescription.id);
        }

        [Fact]
        public async Task CreatePrescriptionAsync_WithInvalidTreatmentId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new PrescriptionDTO { treatment_id = Guid.NewGuid(), drug_name = "Test" };
            _mockTreatmentRepo.Setup(repo => repo.ExistsAsync(dto.treatment_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreatePrescriptionAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Treatment not found");
        }

        [Fact]
        public async Task UpdatePrescriptionAsync_WhenPrescriptionNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var prescriptionId = Guid.NewGuid();
            var dto = new PrescriptionDTO { treatment_id = Guid.NewGuid(), drug_name = "Test" };
            _mockPrescriptionRepo.Setup(repo => repo.GetByIdAsync(prescriptionId)).ReturnsAsync((Prescription)null);

            // Act
            Func<Task> act = () => _sut.UpdatePrescriptionAsync(prescriptionId, dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Prescription not found");
        }

        [Fact]
        public async Task DeletePrescriptionAsync_WhenPrescriptionExists_ShouldReturnTrue()
        {
            // Arrange
            var prescription = CreateTestPrescription(Guid.NewGuid());
            _mockPrescriptionRepo.Setup(repo => repo.GetByIdAsync(prescription.id)).ReturnsAsync(prescription);

            // Act
            var result = await _sut.DeletePrescriptionAsync(prescription.id);

            // Assert
            result.Should().BeTrue();
            _mockPrescriptionRepo.Verify(repo => repo.Delete(prescription), Times.Once);
            _mockPrescriptionRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }
    }
}
