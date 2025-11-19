using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Services;
using ClinicApi.Services.Implementations;
using FluentAssertions;
using Moq;
using Xunit;


// Note: The namespace is kept as 'Appointments' to avoid conflicts with class names.
namespace ClinicApi.Tests.Unit.Appointments
{
    public class AppointmentServiceTests
    {
        private readonly Mock<IRepository<Appointment>> _mockAppointmentRepo;
        private readonly Mock<IRepository<AppointmentStatus>> _mockStatusRepo;
        private readonly Mock<IRepository<Patient>> _mockPatientRepo;
        private readonly Mock<IRepository<ClinicApi.Models.Entities.Staff>> _mockStaffRepo;
        private readonly IAppointmentService _sut; // System Under Test

        public AppointmentServiceTests()
        {
            _mockAppointmentRepo = new Mock<IRepository<Appointment>>();
            _mockStatusRepo = new Mock<IRepository<AppointmentStatus>>();
            _mockPatientRepo = new Mock<IRepository<Patient>>();
            _mockStaffRepo = new Mock<IRepository<ClinicApi.Models.Entities.Staff>>();

            _sut = new AppointmentService(
                _mockAppointmentRepo.Object,
                _mockStatusRepo.Object,
                _mockPatientRepo.Object,
                _mockStaffRepo.Object
            );
        }

        // CORRECTED: This helper method now correctly initializes all 'required' properties
        // for Appointment and its nested required entities like Patient and Staff.
        private Appointment CreateTestAppointment(Guid id)
        {
            var patientPerson = new Person { first_name = "Test", last_name = "Patient", email = "p@test.com", phone_number = "1", address = "1", a_identifier = "1" };
            var staffPerson = new Person { first_name = "Test", last_name = "Doctor", email = "d@test.com", phone_number = "1", address = "1", a_identifier = "1" };

            return new Appointment
            {
                id = id,
                patient_id = Guid.NewGuid(),
                staff_id = Guid.NewGuid(),
                status_id = Guid.NewGuid(),
                appointment_start_time = DateTime.UtcNow,
                duration_minutes = 30,
                patient = new Patient
                {
                    Person = patientPerson,
                    appointments = new List<Appointment>(),
                    treatments = new List<Treatment>(),
                    billings = new List<Billing>(),
                    teeth = new List<Tooth>(),
                    documents = new List<Document>(),
                    sale_items = new List<SaleItem>()
                },
                staff = new ClinicApi.Models.Entities.Staff
                {
                    person = staffPerson,
                    role = new Role { staff = new List<ClinicApi.Models.Entities.Staff>(), name = "Dentist" },
                    specialty = new Specialty(),
                    appointments = new List<Appointment>(),
                    treatments = new List<Treatment>(),
                    license_number = "123"
                },
                status = new AppointmentStatus { name = "Scheduled", appointments = new List<Appointment>() },
                treatments = new List<Treatment>()
            };
        }

        [Fact]
        public async Task GetAllAppointmentsAsync_WhenAppointmentsExist_ShouldReturnDtos()
        {
            // Arrange
            var appointments = new List<Appointment>
            {
                CreateTestAppointment(Guid.NewGuid()),
                CreateTestAppointment(Guid.NewGuid())
            };
            _mockAppointmentRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(appointments);

            // Act
            var result = await _sut.GetAllAppointmentsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetAppointmentByIdAsync_WhenAppointmentExists_ShouldReturnCorrectDto()
        {
            // Arrange
            var appointment = CreateTestAppointment(Guid.NewGuid());
            _mockAppointmentRepo.Setup(repo => repo.GetByIdAsync(appointment.id)).ReturnsAsync(appointment);

            // Act
            var result = await _sut.GetAppointmentByIdAsync(appointment.id);

            // Assert
            result.Should().NotBeNull();
            result.id.Should().Be(appointment.id);
        }

        [Fact]
        public async Task GetAppointmentByIdAsync_WhenAppointmentDoesNotExist_ShouldReturnNull()
        {
            // Arrange
            _mockAppointmentRepo.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Appointment)null);

            // Act
            var result = await _sut.GetAppointmentByIdAsync(Guid.NewGuid());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateAppointmentAsync_WithValidData_ShouldCreateAndReturnDto()
        {
            // Arrange
            var appointmentDto = new AppointmentDTO
            {
                patient_id = Guid.NewGuid(),
                staff_id = Guid.NewGuid(),
                status_id = Guid.NewGuid(),
                reason_for_visit = "Test"
            };

            _mockPatientRepo.Setup(repo => repo.ExistsAsync(appointmentDto.patient_id)).ReturnsAsync(true);
            _mockStaffRepo.Setup(repo => repo.ExistsAsync(appointmentDto.staff_id)).ReturnsAsync(true);
            _mockStatusRepo.Setup(repo => repo.ExistsAsync(appointmentDto.status_id)).ReturnsAsync(true);

            // Act
            var result = await _sut.CreateAppointmentAsync(appointmentDto);

            // Assert
            result.Should().NotBeNull();
            result.patient_id.Should().Be(appointmentDto.patient_id);
            _mockAppointmentRepo.Verify(repo => repo.AddAsync(It.IsAny<Appointment>()), Times.Once);
            _mockAppointmentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteAppointmentAsync_WhenAppointmentExists_ShouldReturnTrue()
        {
            // Arrange
            var appointment = CreateTestAppointment(Guid.NewGuid());
            _mockAppointmentRepo.Setup(repo => repo.GetByIdAsync(appointment.id)).ReturnsAsync(appointment);

            // Act
            var result = await _sut.DeleteAppointmentAsync(appointment.id);

            // Assert
            result.Should().BeTrue();
            _mockAppointmentRepo.Verify(repo => repo.Delete(appointment), Times.Once);
            _mockAppointmentRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteAppointmentAsync_WhenAppointmentDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            var appointmentId = Guid.NewGuid();
            _mockAppointmentRepo.Setup(repo => repo.GetByIdAsync(appointmentId)).ReturnsAsync((Appointment)null);

            // Act
            var result = await _sut.DeleteAppointmentAsync(appointmentId);

            // Assert
            result.Should().BeFalse();
            _mockAppointmentRepo.Verify(repo => repo.Delete(It.IsAny<Appointment>()), Times.Never);
        }
    }
}
