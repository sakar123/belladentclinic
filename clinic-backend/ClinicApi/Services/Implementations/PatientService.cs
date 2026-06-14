using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Linq;

namespace ClinicApi.Services.Implementations
{
    public class PatientService : IPatientService
    {
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Person> _personRepository;
        private readonly IRepository<Tooth> _toothRepository;
        private readonly IRepository<ToothStatus> _toothStatusRepository;
        private readonly ILogger<PatientService> _logger;
        private readonly IRepository<Treatment> _treatmentRepository;
        private readonly IRepository<Billing> _billingRepository;

        public PatientService(
            IRepository<Patient> patientRepository,
            IRepository<Person> personRepository,
            IRepository<Tooth> toothRepository,
            IRepository<ToothStatus> toothStatusRepository,
            IRepository<Treatment> treatmentRepository,
            IRepository<Billing> billingRepository,
            ILogger<PatientService> logger)
        {
            _patientRepository = patientRepository;
            _personRepository = personRepository;
            _toothRepository = toothRepository;
            _toothStatusRepository = toothStatusRepository;
            _treatmentRepository = treatmentRepository;
            _billingRepository = billingRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<PatientDTO>> GetAllPatientsAsync()
        {
            var patients = await _patientRepository.GetAllAsync();
            // Ensure Person is populated for mapping
            foreach (var p in patients)
            {
                if (p.Person == null && p.person_id != Guid.Empty)
                {
                    var person = await _personRepository.GetByIdAsync(p.person_id);
                    p.Person = person;
                }
            }
            var visited = new HashSet<object>();
            return patients.Select(p => PatientMapper.ToDto(p, visited)).ToList();
        }

        public async Task<PatientDTO> GetPatientByIdAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            if (patient == null) return null;
            if (patient.Person == null && patient.person_id != Guid.Empty)
            {
                patient.Person = await _personRepository.GetByIdAsync(patient.person_id);
            }

            // Ensure teeth exist for existing patients (backfill if missing)
            try
            {
                var existing = await _toothRepository.FindAsync(t => t.patient_id == patient.id);
                if (!existing.Any())
                {
                    await EnsureInitialTeethAsync(patient, patient.Person?.date_of_birth);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to backfill teeth for patient {PatientId}", patient.id);
            }

            var visited = new HashSet<object>();
            return PatientMapper.ToDto(patient, visited);
        }

        public async Task<Patient> FindOrCreatePatientFromLandingPageAsync(LandingPageAppointmentRequestDto request)
        {
            var person = (await _personRepository.FindAsync(p => p.email == request.Email)).FirstOrDefault();
            if (person != null)
            {
                var patient = (await _patientRepository.FindAsync(p => p.person_id == person.id)).FirstOrDefault();
                if (patient != null)
                {
                    return patient;
                }
            }

            // If we reach here, either person doesn't exist or they aren't a patient yet.
            // Create a new Person and Patient.
            var nameParts = request.FullName.Split(new[] { ' ' }, 2);
            var firstName = nameParts.Length > 0 ? nameParts[0] : request.FullName;
            var lastName = nameParts.Length > 1 ? nameParts[1] : "(Not Provided)";
            var genderText = string.IsNullOrWhiteSpace(request.Gender) ? "Prefer not to say" : request.Gender.Trim();
            _logger.LogInformation("LandingPage patient gender received. Raw='{GenderRaw}', Stored='{StoredGender}'", request.Gender, genderText);

            var newPerson = new Person
            {
                id = Guid.NewGuid(),
                first_name = firstName,
                last_name = lastName,
                email = request.Email,
                phone_number = request.Phone,
                gender = genderText
            };
            await _personRepository.AddAsync(newPerson);

            var newPatient = new Patient
            {
                id = Guid.NewGuid(),
                person_id = newPerson.id,
                Person = newPerson
            };
            await _patientRepository.AddAsync(newPatient);

            try
            {
                await _personRepository.SaveChangesAsync(); // This should save both via the DbContext transaction
            }
            catch (DbUpdateException ex)
            {
                var baseEx = ex.GetBaseException();
                if (baseEx is PostgresException pg)
                {
                    _logger.LogError(ex,
                        "Postgres error during SaveChanges for LandingPage patient create. SqlState={SqlState}, MessageText='{MessageText}', Hint='{Hint}', Detail='{Detail}', Schema='{Schema}', Table='{Table}', Column='{Column}', DataType='{DataType}', Constraint='{Constraint}', Position={Position}. PersonEmail='{Email}', Gender='{Gender}'",
                        pg.SqlState,
                        pg.MessageText,
                        pg.Hint,
                        pg.Detail,
                        pg.SchemaName,
                        pg.TableName,
                        pg.ColumnName,
                        pg.DataTypeName,
                        pg.ConstraintName,
                        pg.Position,
                        request.Email,
                        genderText);
                }
                else
                {
                    _logger.LogError(ex, "DbUpdateException during SaveChanges for LandingPage patient create. PersonEmail='{Email}', Gender='{Gender}'", request.Email, genderText);
                }
                throw;
            }

            // Auto-create initial teeth set based on age if DOB provided
            try { await EnsureInitialTeethAsync(newPatient, newPerson.date_of_birth); }
            catch (Exception ex) { _logger.LogWarning(ex, "Failed to seed initial teeth for patient {PatientId}", newPatient.id); }

            return newPatient;
        }

        public async Task<PatientDTO> CreatePatientAsync(PatientDTO patientDto)
        {
            var visited = new HashSet<object>();

            // Create Person first
            var person = new Person
            {
                id = Guid.NewGuid(),
                first_name = patientDto.person.first_name ?? string.Empty,
                last_name = patientDto.person.last_name ?? string.Empty,
                email = patientDto.person.email ?? string.Empty,
                phone_number = patientDto.person.phone_number ?? string.Empty,
                address = patientDto.person.address ?? string.Empty,
                a_identifier = patientDto.person.a_identifier ?? string.Empty,
                date_of_birth = patientDto.person.date_of_birth,
                gender = patientDto.person.gender
            };

            await _personRepository.AddAsync(person);
            await _personRepository.SaveChangesAsync();

            // Create Patient linked to Person
            var patient = new Patient
            {
                id = Guid.NewGuid(),
                person_id = person.id,
                emergency_contact_name = patientDto.emergency_contact_name,
                emergency_contact_phone = patientDto.emergency_contact_phone,
                Person = person,
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>(),
                billings = new List<Billing>(),
                teeth = new List<Tooth>(),
                documents = new List<Document>(),
                sale_items = new List<SaleItem>()
            };

            await _patientRepository.AddAsync(patient);
            await _patientRepository.SaveChangesAsync();

            // Auto-create initial teeth set based on age if DOB provided
            try { await EnsureInitialTeethAsync(patient, person.date_of_birth); }
            catch (Exception ex) { _logger.LogWarning(ex, "Failed to seed initial teeth for patient {PatientId}", patient.id); }

            return PatientMapper.ToDto(patient, visited);
        }

        public async Task<PatientDTO> UpdatePatientAsync(Guid id, PatientDTO patientDto)
        {
            var existingPatient = await _patientRepository.GetByIdAsync(id);
            if (existingPatient == null)
                throw new KeyNotFoundException("Patient not found");

            var existingPerson = await _personRepository.GetByIdAsync(existingPatient.person_id);
            if (existingPerson == null)
                throw new KeyNotFoundException("Person not found");

            // Update Person fields
            existingPerson.first_name = patientDto.person.first_name ?? existingPerson.first_name;
            existingPerson.last_name = patientDto.person.last_name ?? existingPerson.last_name;
            existingPerson.email = patientDto.person.email ?? existingPerson.email;
            existingPerson.phone_number = patientDto.person.phone_number ?? existingPerson.phone_number;
            existingPerson.address = patientDto.person.address ?? existingPerson.address;
            existingPerson.a_identifier = patientDto.person.a_identifier ?? existingPerson.a_identifier;

            await _personRepository.UpdateAsync(existingPerson);
            await _personRepository.SaveChangesAsync();

            // Update Patient fields
            existingPatient.emergency_contact_name = patientDto.emergency_contact_name ?? existingPatient.emergency_contact_name;
            existingPatient.emergency_contact_phone = patientDto.emergency_contact_phone ?? existingPatient.emergency_contact_phone;

            await _patientRepository.UpdateAsync(existingPatient);
            await _patientRepository.SaveChangesAsync();

            return PatientMapper.ToDto(existingPatient, new HashSet<object>());
        }

        public async Task<bool> DeletePatientAsync(Guid id)
        {
            var patient = await _patientRepository.GetByIdAsync(id);
            if (patient == null)
            {
                return false;
            }

            // Pre-delete restricted dependencies: Treatments and Billings
            var treatments = await _treatmentRepository.FindAsync(t => t.patient_id == patient.id);
            foreach (var t in treatments)
            {
                await _treatmentRepository.DeleteAsync(t);
            }
            await _treatmentRepository.SaveChangesAsync();

            var billings = await _billingRepository.FindAsync(b => b.patient_id == patient.id);
            foreach (var b in billings)
            {
                await _billingRepository.DeleteAsync(b);
            }
            await _billingRepository.SaveChangesAsync();

            // Now delete the Person (cascade removes Patient, Appointments, Teeth, Documents, SaleItems, etc.)
            var person = await _personRepository.GetByIdAsync(patient.person_id);
            if (person != null)
            {
                await _personRepository.DeleteAsync(person);
                await _personRepository.SaveChangesAsync();
            }

            return true;
        }

        private async Task EnsureInitialTeethAsync(Patient patient, DateTime? dob)
        {
            // If patient already has teeth, skip
            var existing = await _toothRepository.FindAsync(t => t.patient_id == patient.id);
            if (existing.Any()) return;

            // Find or create a HEALTHY status
            var allStatuses = await _toothStatusRepository.GetAllAsync();
            var healthy = allStatuses.FirstOrDefault(s => (s.code ?? string.Empty).ToUpper().StartsWith("HEALTHY"));
            if (healthy == null)
            {
                healthy = new ToothStatus { id = Guid.NewGuid(), code = "HEALTHY", description = "Healthy", teeth = new List<Tooth>() };
                await _toothStatusRepository.AddAsync(healthy);
                await _toothStatusRepository.SaveChangesAsync();
            }

            var isPrimary = false;
            if (dob.HasValue)
            {
                var today = DateTime.UtcNow.Date;
                var ageYears = today.Year - dob.Value.Year - ((today.Month < dob.Value.Month || (today.Month == dob.Value.Month && today.Day < dob.Value.Day)) ? 1 : 0);
                isPrimary = ageYears < 14;
            }

            var teethToCreate = new List<Tooth>();
            if (isPrimary)
            {
                // Universal primary numbering: 1-20
                for (int i = 1; i <= 20; i++)
                {
                    teethToCreate.Add(new Tooth
                    {
                        id = Guid.NewGuid(),
                        patient_id = patient.id,
                        tooth_number = i,
                        tooth_name = PrimaryToothNameByUniversalIndex(i),
                        tooth_status_id = healthy.id,
                        patient = patient,
                        tooth_status = healthy,
                        treatments = new List<Treatment>(),
                        documents = new List<Document>()
                    });
                }
            }
            else
            {
                // Universal permanent numbering: 1-32
                for (int i = 1; i <= 32; i++)
                {
                    teethToCreate.Add(new Tooth
                    {
                        id = Guid.NewGuid(),
                        patient_id = patient.id,
                        tooth_number = i,
                        tooth_name = AdultToothNameByUniversalIndex(i),
                        tooth_status_id = healthy.id,
                        patient = patient,
                        tooth_status = healthy,
                        treatments = new List<Treatment>(),
                        documents = new List<Document>()
                    });
                }
            }

            foreach (var t in teethToCreate)
            {
                await _toothRepository.AddAsync(t);
            }
            await _toothRepository.SaveChangesAsync();
        }

        private static string AdultToothName(int quadrant, int pos)
        {
            // Names per position
            string[] names = { "", "Central Incisor", "Lateral Incisor", "Canine", "First Premolar", "Second Premolar", "First Molar", "Second Molar", "Third Molar" };
            string jaw = (quadrant == 1 || quadrant == 2) ? "Upper" : "Lower";
            string side = (quadrant == 1 || quadrant == 4) ? "Right" : "Left";
            return $"{jaw} {side} {names[Math.Clamp(pos,1,8)]}".Trim();
        }

        private static string PrimaryToothName(int quadrant, int pos)
        {
            // Names per position for primary
            string[] names = { "", "Central Incisor", "Lateral Incisor", "Canine", "First Molar", "Second Molar" };
            string jaw = (quadrant == 5 || quadrant == 6) ? "Upper" : "Lower";
            string side = (quadrant == 5 || quadrant == 8) ? "Right" : "Left";
            return $"{jaw} {side} {names[Math.Clamp(pos,1,5)]}".Trim();
        }

        private static string AdultToothNameByUniversalIndex(int index)
        {
            // Universal mapping: 1-8 (UR), 9-16 (UL), 17-24 (LL), 25-32 (LR)
            int quadrant;
            int pos;
            if (index >= 1 && index <= 8) { quadrant = 1; pos = index; }
            else if (index <= 16) { quadrant = 2; pos = index - 8; }
            else if (index <= 24) { quadrant = 3; pos = index - 16; }
            else { quadrant = 4; pos = index - 24; }
            return AdultToothName(quadrant, pos);
        }

        private static string PrimaryToothNameByUniversalIndex(int index)
        {
            // Universal primary: 1-5 (UR), 6-10 (UL), 11-15 (LL), 16-20 (LR)
            int quadrant;
            int pos;
            if (index >= 1 && index <= 5) { quadrant = 5; pos = index; }
            else if (index <= 10) { quadrant = 6; pos = index - 5; }
            else if (index <= 15) { quadrant = 7; pos = index - 10; }
            else { quadrant = 8; pos = index - 15; }
            return PrimaryToothName(quadrant, pos);
        }
    }
}
