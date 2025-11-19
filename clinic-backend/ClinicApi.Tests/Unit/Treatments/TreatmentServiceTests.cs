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

namespace ClinicApi.Tests.Unit.Treatments
{
    public class TreatmentServiceTests
    {
        private readonly Mock<IRepository<Treatment>> _mockTreatmentRepo;
        private readonly Mock<IRepository<Appointment>> _mockAppointmentRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<ClinicApi.Models.Entities.Staff>> _mockStaffRepo;
        private readonly Mock<IRepository<Service>> _mockServiceRepo;
        private readonly ITreatmentService _sut;

        public TreatmentServiceTests()
        {
            _mockTreatmentRepo = new Mock<IRepository<Treatment>>();
            _mockAppointmentRepo = new Mock<IRepository<Appointment>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockStaffRepo = new Mock<IRepository<ClinicApi.Models.Entities.Staff>>();
            _mockServiceRepo = new Mock<IRepository<Service>>();

            _sut = new TreatmentService(
                _mockTreatmentRepo.Object,
                _mockAppointmentRepo.Object,
                _mockPatientRepo.Object,
                _mockStaffRepo.Object,
                _mockServiceRepo.Object
            );
        }

        private Treatment CreateTestTreatment(Guid id)
        {
             var patientPerson = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
             var staffPerson = new Person { first_name = "Test", last_name = "Doctor", email = "d@test.com", phone_number = "1", address = "1", a_identifier = "1" };
             var patient = new Patient { Person = patientPerson, appointments = new List<Appointment>(), treatments = new List<Treatment>(), billings = new List<Billing>(), teeth = new List<Tooth>(), documents = new List<Document>(), sale_items = new List<SaleItem>() };

            return new Treatment
            {
                id = id,
                appointment_id = Guid.NewGuid(),
                patient_id = Guid.NewGuid(),
                staff_id = Guid.NewGuid(),
                service_id = Guid.NewGuid(),
                appointment = new Appointment 
                { 
                    patient = patient,
                    staff = new ClinicApi.Models.Entities.Staff { person = staffPerson, role = new Role { staff = new List<Staff>(), name = "Dentist"}, specialty = new Specialty(), appointments = new List<Appointment>(), treatments = new List<Treatment>(), license_number="123" },
                    status = new AppointmentStatus { name = "Scheduled", appointments = new List<Appointment>() },
                    treatments = new List<Treatment>()
                },
                patient = patient,
                staff = new ClinicApi.Models.Entities.Staff { person = staffPerson, role = new Role { staff = new List<Staff>(), name = "Dentist" }, specialty = new Specialty(), appointments = new List<Appointment>(), treatments = new List<Treatment>(), license_number = "123" },
                service = new Service { specialty = new Specialty(), treatments = new List<Treatment>(), name = "Crown Adding" },
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>(),
                Tooth = new Tooth { patient = patient, tooth_name ="molar",tooth_status = new ToothStatus { teeth = new List<Tooth>() } }
            };
        }

        [Fact]
        public async Task GetAllTreatmentsAsync_WhenTreatmentsExist_ShouldReturnDtos()
        {
            // Arrange
            var treatments = new List<Treatment> { CreateTestTreatment(Guid.NewGuid()), CreateTestTreatment(Guid.NewGuid()) };
            _mockTreatmentRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(treatments);

            // Act
            var result = await _sut.GetAllTreatmentsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetTreatmentByIdAsync_WhenTreatmentExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var treatment = CreateTestTreatment(Guid.NewGuid());
            _mockTreatmentRepo.Setup(repo => repo.GetByIdAsync(treatment.id)).ReturnsAsync(treatment);

            // Act
            var result = await _sut.GetTreatmentByIdAsync(treatment.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(treatment.id);
        }
        
        [Fact]
        public async Task CreateTreatmentAsync_WithInvalidAppointmentId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new TreatmentDTO { appointment_id = Guid.NewGuid(), patient_id = Guid.NewGuid(), staff_id = Guid.NewGuid(), service_id = Guid.NewGuid() };
            _mockAppointmentRepo.Setup(repo => repo.ExistsAsync(dto.appointment_id)).ReturnsAsync(false);

            // Act
            Func<Task> act = () => _sut.CreateTreatmentAsync(dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Appointment not found");
        }
        
        [Fact]
        public async Task UpdateTreatmentAsync_WhenTreatmentNotFound_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var dto = new TreatmentDTO { appointment_id = Guid.NewGuid(), patient_id = Guid.NewGuid(), staff_id = Guid.NewGuid(), service_id = Guid.NewGuid() };
             _mockTreatmentRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Treatment)null);

            // Act
            Func<Task> act = () => _sut.UpdateTreatmentAsync(Guid.NewGuid(), dto);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Treatment not found");
        }

        [Fact]
        public async Task DeleteTreatmentAsync_WhenTreatmentExists_ShouldReturnTrue()
        {
            // Arrange
            var treatment = CreateTestTreatment(Guid.NewGuid());
            _mockTreatmentRepo.Setup(repo => repo.GetByIdAsync(treatment.id)).ReturnsAsync(treatment);
            
            // Act
            var result = await _sut.DeleteTreatmentAsync(treatment.id);
            
            // Assert
            result.Should().BeTrue();
            _mockTreatmentRepo.Verify(r => r.Delete(treatment), Times.Once);
            _mockTreatmentRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }
}

