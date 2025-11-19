using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;

namespace ClinicApi.Tests.Utilities
{
    /// <summary>
    /// A helper class to seed the in-memory database with entities for integration tests.
    /// </summary>
    public static class TestDataSeeder
    {
        public static async Task<(Patient patient, Staff staff, AppointmentStatus status)> SeedBasicAppointmentDependenciesAsync(DentalClinicContext context)
        {
            var role = new Role
            {
                id = Guid.NewGuid(),
                name = "Test Dentist",
                description = "Seeded for testing", // Added required property
                staff = new List<Staff>()
            };

            var specialty = new Specialty
            {
                id = Guid.NewGuid(),
                name = "Test Specialty",
                description = "Seeded for testing", // Added required property
                staff = new List<Staff>(),
                services = new List<Service>()
            };

            var status = new AppointmentStatus { id = Guid.NewGuid(), name = "Scheduled", appointments = new List<Appointment>() };

            var patientPerson = new Person { id = Guid.NewGuid(), first_name = "Test", last_name = "Patient", email = $"p{Guid.NewGuid()}@test.com", phone_number = "1", address = "1", a_identifier = "1" };
            var staffPerson = new Person { id = Guid.NewGuid(), first_name = "Test", last_name = "Doctor", email = $"d{Guid.NewGuid()}@test.com", phone_number = "1", address = "1", a_identifier = "1" };

            var patient = new Patient
            {
                id = Guid.NewGuid(),
                person_id = patientPerson.id,
                Person = patientPerson,
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>(),
                billings = new List<Billing>(),
                teeth = new List<Tooth>(),
                documents = new List<Document>(),
                sale_items = new List<SaleItem>()
            };

            var staff = new Staff
            {
                id = Guid.NewGuid(),
                person_id = staffPerson.id,
                role_id = role.id,
                specialty_id = specialty.id,
                license_number = Guid.NewGuid().ToString(),
                person = staffPerson,
                role = role,
                specialty = specialty,
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>()
            };

            context.AddRange(role, specialty, status, patientPerson, staffPerson, patient, staff);
            await context.SaveChangesAsync();

            return (patient, staff, status);
        }

        public static async Task<Appointment> SeedAppointmentAsync(DentalClinicContext context, Guid patientId, Guid staffId, Guid statusId)
        {
            var appointment = new Appointment
            {
                id = Guid.NewGuid(),
                patient_id = patientId,
                staff_id = staffId,
                status_id = statusId,
                appointment_start_time = DateTime.UtcNow.AddDays(1),
                duration_minutes = 60,
                reason_for_visit = "Seeded Appointment",
                patient = await context.Patient.FindAsync(patientId),
                staff = await context.Staff.FindAsync(staffId),
                status = await context.AppointmentStatus.FindAsync(statusId),
                treatments = new List<Treatment>()
            };

            context.Appointment.Add(appointment);
            await context.SaveChangesAsync();
            return appointment;
        }
        public static async Task<Billing> SeedBillingAsync(DentalClinicContext context, Guid patientId)
        {
            var billing = new Billing
            {
                id = Guid.NewGuid(),
                patient_id = patientId,
                issue_date = DateTime.UtcNow,
                due_date = DateTime.UtcNow.AddDays(30),
                total_amount = 500,
                amount_paid = 200,
                status = BillStatusEnum.Partial,
                patient = await context.Patient.FindAsync(patientId),
                billing_line_Item = new List<BillingLineItem>(),
                payment = new List<Payment>()
            };

            context.Billing.Add(billing);
            await context.SaveChangesAsync();
            return billing;
        }
        public static async Task<Patient> SeedPatientAsync(DentalClinicContext context)
        {
            // First, it creates the underlying Person record.
            var person = await SeedPersonAsync(context, $"patient-{Guid.NewGuid()}@test.com");

            // Then, it creates the Patient record linked to the Person.
            var patient = new Patient
            {
                id = Guid.NewGuid(),
                person_id = person.id,
                Person = person,
                // Initializes required collections to prevent errors
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>(),
                billings = new List<Billing>(),
                teeth = new List<Tooth>(),
                documents = new List<Document>(),
                sale_items = new List<SaleItem>()
            };
            context.Patient.Add(patient);
            await context.SaveChangesAsync();
            return patient;
        }

        // This is the dependency for SeedPatientAsync
        public static async Task<Person> SeedPersonAsync(DentalClinicContext context, string email)
        {
            var person = new Person
            {
                id = Guid.NewGuid(),
                first_name = "Test",
                last_name = "Person",
                email = email,
                phone_number = "555-555-5555",
                address = "123 Test St",
                a_identifier = "ID-12345"
            };
            context.Person.Add(person);
            await context.SaveChangesAsync();
            return person;
        }
        public static async Task<Staff> SeedStaffAsync(DentalClinicContext context)
        {
            var person = await SeedPersonAsync(context, $"staff-{Guid.NewGuid()}@test.com");
            var role = await SeedRoleAsync(context, $"Role-{Guid.NewGuid()}");
            var specialty = await SeedSpecialtyAsync(context, $"Specialty-{Guid.NewGuid()}");

            var staff = new Staff
            {
                id = Guid.NewGuid(),
                person_id = person.id,
                role_id = role.id,
                specialty_id = specialty.id,
                license_number = Guid.NewGuid().ToString(),
                person = person,
                role = role,
                specialty = specialty,
                appointments = new List<Appointment>(),
                treatments = new List<Treatment>()
            };
            context.Staff.Add(staff);
            await context.SaveChangesAsync();
            return staff;
        }
        public static async Task<Specialty> SeedSpecialtyAsync(DentalClinicContext context, string name = "Test Specialty")
        {
            var specialty = new Specialty
            {
                id = Guid.NewGuid(),
                name = name,
                description = "Seeded for testing",
                staff = new List<Staff>(),
                services = new List<Service>()
            };
            context.Specialty.Add(specialty);
            await context.SaveChangesAsync();
            return specialty;
        }
        public static async Task<Role> SeedRoleAsync(DentalClinicContext context, string name = "Test Role")
        {
            var role = new Role
            {
                id = Guid.NewGuid(),
                name = name,
                description = "Seeded for testing",
                staff = new List<Staff>()
            };
            context.Role.Add(role);
            await context.SaveChangesAsync();
            return role;
        }
        public static async Task<DocumentType> SeedDocumentTypeAsync(DentalClinicContext context, string code = "XRAY")
        {
            var docType = new DocumentType
            {
                id = Guid.NewGuid(),
                document_type_code = code,
                name = "Test Document Type",
                description = "Seeded for testing",
                documents = new List<Document>()
            };
            context.DocumentType.Add(docType);
            await context.SaveChangesAsync();
            return docType;
        }
        public static async Task<ToothStatus> SeedToothStatusAsync(DentalClinicContext context, string code = "HEALTHY")
        {
            // 1. Create a new ToothStatus object. 
            //    A GUID is appended to the code to ensure it's unique for each test run,
            //    preventing conflicts if multiple tests create a status with the same base code.
            var toothStatus = new ToothStatus 
            { 
                id = Guid.NewGuid(), 
                code = $"{code}-{Guid.NewGuid()}", 
                description = "Healthy", 
                // 2. Initialize the required 'teeth' collection.
                teeth = new List<Tooth>() 
            };

            // 3. Add the new object to the DbContext.
            context.ToothStatus.Add(toothStatus);

            // 4. Save the changes to the in-memory database.
            await context.SaveChangesAsync();

            // 5. Return the newly created status so other methods can use its ID.
            return toothStatus;
        }

        public static async Task<Tooth> SeedToothAsync(DentalClinicContext context, Patient patient)
        {
            var toothStatus = new ToothStatus { id = Guid.NewGuid(), code = $"HEALTHY-{Guid.NewGuid()}", description = "Healthy", teeth = new List<Tooth>() };
            context.ToothStatus.Add(toothStatus);

            var tooth = new Tooth
            {
                id = Guid.NewGuid(),
                patient_id = patient.id,
                tooth_number = new Random().Next(1, 32),
                tooth_name = "Seeded Molar",
                tooth_status_id = toothStatus.id,
                patient = patient,
                tooth_status = toothStatus,
                treatments = new List<Treatment>(),
                documents = new List<Document>()
            };
            context.Tooth.Add(tooth);
            await context.SaveChangesAsync();
            return tooth;
        }

        public static async Task<Service> SeedServiceAsync(DentalClinicContext context)
        {
            var specialty = await SeedSpecialtyAsync(context, $"ServiceSpecialty-{Guid.NewGuid()}");
            var service = new Service
            {
                id = Guid.NewGuid(),
                name = "Test Service",
                cost = 100,
                specialty_id = specialty.id,
                specialty = specialty,
                treatments = new List<Treatment>()
            };
            context.Service.Add(service);
            await context.SaveChangesAsync();
            return service;
        }
        public static async Task<Treatment> SeedFullTreatmentScenarioAsync(DentalClinicContext context)
        {
            // 1. Creates a Patient (which also creates a Person).
            var patient = await SeedPatientAsync(context);

            // 2. Creates a Tooth associated with that Patient.
            var tooth = await SeedToothAsync(context, patient);

            // 3. Creates a Staff member (which creates another Person, a Role, and a Specialty).
            var staff = await SeedStaffAsync(context);

            // 4. Creates an AppointmentStatus.
            var status = await SeedAppointmentStatusAsync(context, $"PrescriptionApptStatus-{Guid.NewGuid()}");

            // 5. Creates an Appointment linking the Patient, Staff, and Status.
            var appointment = await SeedAppointmentAsync(context, patient.id, staff.id, status.id);

            // 6. Creates a Service that can be performed.
            var service = await SeedServiceAsync(context);

            // 7. Finally, creates the Treatment, linking all the above entities.
            var treatment = await SeedTreatmentAsync(context, appointment, staff, service, tooth);

            return treatment;
        }
        public static async Task<Prescription> SeedPrescriptionAsync(DentalClinicContext context, Guid treatmentId)
        {
            // 1. Creates a new Prescription object with valid data.
            var prescription = new Prescription
            {
                id = Guid.NewGuid(),
                treatment_id = treatmentId,
                drug_name = "Seeded Drug",
                dosage = "500mg",
                instructions = "Take as needed",
                // 2. Links it to the existing Treatment entity.
                treatment = await context.Treatment.FindAsync(treatmentId)
            };

            // 3. Adds it to the DbContext and saves it to the in-memory database.
            context.Prescription.Add(prescription);
            await context.SaveChangesAsync();
            
            // 4. Returns the created entity for the test to use.
            return prescription;
        }
        public static async Task<Treatment> SeedTreatmentAsync(DentalClinicContext context, Appointment appointment, Staff staff, Service service, Tooth tooth)
        {
            var treatment = new Treatment
            {
                id = Guid.NewGuid(),
                appointment_id = appointment.id,
                patient_id = appointment.patient_id,
                staff_id = staff.id,
                service_id = service.id,
                tooth_id = tooth.id,
                appointment = appointment,
                patient = appointment.patient,
                staff = staff,
                service = service,
                tooth = tooth,
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>()
            };
            context.Treatment.Add(treatment);
            await context.SaveChangesAsync();
            return treatment;
        }

        public static async Task<Document> SeedDocumentAsync(DentalClinicContext context, Guid patientId, Guid docTypeId, Guid? toothId = null, Guid? treatmentId = null)
        {
            var document = new Document
            {
                id = Guid.NewGuid(),
                patient_id = patientId,
                document_type_id = docTypeId,
                tooth_id = toothId,
                treatment_id = treatmentId,
                description = "Seeded Document",
                document_path = "/seeded/path.jpg",
                upload_date = DateTime.UtcNow,
                patient = await context.Patient.FindAsync(patientId),
                document_type = await context.DocumentType.FindAsync(docTypeId)
            };
            context.Document.Add(document);
            await context.SaveChangesAsync();
            return document;
        }
        public static async Task<(Patient patient, DocumentType docType, Tooth tooth, Treatment treatment)> SeedDocumentDependenciesAsync(DentalClinicContext context)
        {
            // 1. Create the core entities a document might relate to.
            var patient = await SeedPatientAsync(context);
            var docType = await SeedDocumentTypeAsync(context, $"CODE-{Guid.NewGuid()}");
            var tooth = await SeedToothAsync(context, patient);

            // 2. Create the entities needed for a valid treatment record.
            var staff = await SeedStaffAsync(context);
            var status = await SeedAppointmentStatusAsync(context, $"DocApptStatus-{Guid.NewGuid()}");
            var appointment = await SeedAppointmentAsync(context, patient.id, staff.id, status.id);
            var service = await SeedServiceAsync(context);

            // 3. Create the treatment itself, which links everything together.
            var treatment = await SeedTreatmentAsync(context, appointment, staff, service, tooth);

            // 4. Return all the created entities so the test method can use their IDs.
            return (patient, docType, tooth, treatment);
        }
        
        public static async Task<AppointmentStatus> SeedAppointmentStatusAsync(DentalClinicContext context, string name)
        {
            // 1. Create a new AppointmentStatus object.
            var status = new AppointmentStatus 
            { 
                id = Guid.NewGuid(), 
                name = name, 
                // 2. Initialize the required 'appointments' collection to prevent errors.
                appointments = new List<Appointment>() 
            };

            // 3. Add the new object to the DbContext.
            context.AppointmentStatus.Add(status);

            // 4. Save the changes to the in-memory database.
            await context.SaveChangesAsync();

            // 5. Return the newly created status so other methods can use its ID.
            return status;
        }
    }
}
