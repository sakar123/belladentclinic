using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicApi.Data
{
    /// <summary>
    /// Database context for the Dental Clinic application.
    /// </summary>
    public class DentalClinicContext : DbContext
    {
        /// <summary>
        /// Constructor that receives database configuration options from dependency injection.
        /// </summary>
        public DentalClinicContext(DbContextOptions<DentalClinicContext> options)
            : base(options) { }


        // DbSets represent database tables. Each DbSet allows you to query and save instances of the entity type.
        // Entity Framework will automatically pick up configurations from IEntityTypeConfiguration classes.
        
        public DbSet<Role> Role { get; set; }
        public DbSet<Specialty> Specialty { get; set; }
        public DbSet<Person> Person { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<Patient> Patient { get; set; }
        public DbSet<Appointment> Appointment { get; set; }
        public DbSet<AppointmentStatus> AppointmentStatus { get; set; }
        public DbSet<ToothStatus> ToothStatus { get; set; }
        public DbSet<Billing> Billing { get; set; }
        public DbSet<BillingLineItem> BillingLineItem { get; set; }
        public DbSet<Tooth> Tooth { get; set; }
        public DbSet<Document> Document { get; set; }
        public DbSet<DocumentType> DocumentType { get; set; }
        public DbSet<Payment> Payment { get; set; }
        public DbSet<DiscountType> DiscountType { get; set; }
        public DbSet<SaleItem> SaleItem { get; set; }
        public DbSet<Treatment> Treatment { get; set; }
        public DbSet<Service> Service { get; set; }
        public DbSet<Prescription> Prescription { get; set; }

        /// <summary>
        /// This method configures the database schema and relationships between entities.
        /// It's called by Entity Framework when creating the database model.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Database stores these as TEXT columns. No enum mapping required.

            // === GLOBAL CONFIGURATIONS ===
            
            // Loop through all entity types in the model
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Convert all table names to lowercase for PostgreSQL naming convention
                entityType.SetTableName(entityType.GetTableName()!.ToLower());
                
                // For all entities that inherit from BaseEntity, configure automatic UUID generation
                // This means every new record will automatically get a unique ID without you having to set it manually
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .Property("Id")
                        .HasDefaultValueSql("uuid_generate_v4()"); // PostgreSQL function to generate UUIDs
                }
            }

            // Override specific table names that use snake_case in the database
            modelBuilder.Entity<AppointmentStatus>().ToTable("appointment_status");
            modelBuilder.Entity<ToothStatus>().ToTable("tooth_status");
            modelBuilder.Entity<BillingLineItem>().ToTable("billing_line_item");
            modelBuilder.Entity<DocumentType>().ToTable("document_type");
            modelBuilder.Entity<DiscountType>().ToTable("discount_type");
            modelBuilder.Entity<SaleItem>().ToTable("sale_item");

            // No enum conversions necessary; properties are strings.
            
            // === ONE-TO-ONE RELATIONSHIPS ===
            // These configurations establish one-to-one relationships between entities
            
            // Staff has one Person record (CASCADE DELETE: deleting Person will delete Staff)
            modelBuilder.Entity<Staff>()
                .HasOne(s => s.person)
                .WithOne()
                .HasForeignKey<Staff>(s => s.person_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Patient has one Person record (CASCADE DELETE: deleting Person will delete Patient)
            modelBuilder.Entity<Patient>()
                .HasOne(p => p.Person)
                .WithOne()
                .HasForeignKey<Patient>(p => p.person_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // === UNIQUE CONSTRAINTS ===
            // Ensure that certain combinations of fields are unique across the table
            
            // Each patient can only have one record per tooth number (prevents duplicate tooth entries)
            modelBuilder.Entity<Tooth>()
                .HasIndex(t => new { t.patient_id, t.tooth_number })
                .IsUnique();
            
            // === ONE-TO-MANY RELATIONSHIPS WITH RESTRICT DELETE ===
            // RESTRICT means you cannot delete the parent if child records exist
            // This prevents accidental data loss by forcing you to handle child records first
            
            // Document must have a DocumentType (RESTRICT: cannot delete DocumentType if Documents exist)
            modelBuilder.Entity<Document>()
                .HasOne(d => d.document_type)
                .WithMany(dt => dt.documents)
                .HasForeignKey(d => d.document_type_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Billing belongs to a Patient (RESTRICT: cannot delete Patient if Billings exist)
            modelBuilder.Entity<Billing>()
                .HasOne(b => b.patient)
                .WithMany(p => p.billings)
                .HasForeignKey(b => b.patient_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Treatment belongs to an Appointment (RESTRICT: cannot delete Appointment if Treatments exist)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.appointment)
                .WithMany(a => a.treatments)
                .HasForeignKey(t => t.appointment_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Treatment belongs to a Patient (RESTRICT: cannot delete Patient if Treatments exist)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.patient)
                .WithMany(p => p.treatments)
                .HasForeignKey(t => t.patient_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Treatment belongs to a Staff member (RESTRICT: cannot delete Staff if Treatments exist)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.staff)
                .WithMany(s => s.treatments)
                .HasForeignKey(t => t.staff_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Treatment uses a Service (RESTRICT: cannot delete Service if Treatments exist)
            modelBuilder.Entity<Treatment>()
                .HasOne(t => t.service)
                .WithMany(s => s.treatments)
                .HasForeignKey(t => t.service_id)
                .OnDelete(DeleteBehavior.Restrict);
            
            // === ONE-TO-MANY RELATIONSHIPS WITH CASCADE DELETE ===
            // CASCADE means deleting the parent automatically deletes all child records
            // Use this when child records don't make sense without their parent
            
            // Appointment belongs to a Patient (CASCADE: deleting Patient deletes all their Appointments)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.patient)
                .WithMany(p => p.appointments)
                .HasForeignKey(a => a.patient_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Appointment belongs to a Staff member (CASCADE: deleting Staff deletes their Appointments)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.staff)
                .WithMany(s => s.appointments)
                .HasForeignKey(a => a.staff_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Appointment has a Status (CASCADE: deleting Status deletes related Appointments)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.status)
                .WithMany(s => s.appointments)
                .HasForeignKey(a => a.status_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // === UNIQUE INDEX CONFIGURATIONS ===
            // Ensure certain fields have unique values across the entire table
            
            // AppointmentStatus names must be unique (e.g., can't have two "Scheduled" statuses)
            modelBuilder.Entity<AppointmentStatus>(entity =>
            {
                entity.HasIndex(e => e.name).IsUnique();
            });

            // ToothStatus codes must be unique (e.g., can't have duplicate status codes)
            modelBuilder.Entity<ToothStatus>(entity =>
            {
                entity.HasIndex(e => e.code).IsUnique();
            });
            
            // === MORE CASCADE DELETE RELATIONSHIPS ===
            
            // Prescription belongs to a Treatment (CASCADE: deleting Treatment deletes its Prescriptions)
            modelBuilder.Entity<Prescription>()
                .HasOne(p => p.treatment)
                .WithMany(t => t.prescriptions)
                .HasForeignKey(p => p.treatment_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // BillingLineItem belongs to a Billing (CASCADE: deleting Billing deletes all line items)
            modelBuilder.Entity<BillingLineItem>()
                .HasOne(bli => bli.billing)
                .WithMany(b => b.billing_line_Item)
                .HasForeignKey(bli => bli.billing_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // === SET NULL DELETE BEHAVIOR ===
            // SET NULL means when the parent is deleted, the foreign key in child is set to NULL
            // This keeps the child record but removes the reference to the deleted parent
            
            // BillingLineItem optionally references a Treatment (SET NULL: deleting Treatment keeps BillingLineItem but clears treatment_id)
            modelBuilder.Entity<BillingLineItem>()
                .HasOne(bli => bli.treatment)
                .WithMany(t => t.billing_line_item)
                .HasForeignKey(bli => bli.treatment_id)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Payment belongs to a Billing (CASCADE: deleting Billing deletes all its Payments)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.billing)
                .WithMany(b => b.payment)
                .HasForeignKey(p => p.billing_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Tooth belongs to a Patient (CASCADE: deleting Patient deletes all their Teeth records)
            modelBuilder.Entity<Tooth>()
                .HasOne(t => t.patient)
                .WithMany(p => p.teeth)
                .HasForeignKey(t => t.patient_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Tooth has a ToothStatus (CASCADE: deleting ToothStatus deletes related Teeth)
            modelBuilder.Entity<Tooth>()
                .HasOne(t => t.tooth_status)
                .WithMany(ts => ts.teeth)
                .HasForeignKey(t => t.tooth_status_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Document belongs to a Patient (CASCADE: deleting Patient deletes their Documents)
            modelBuilder.Entity<Document>()
                .HasOne(d => d.patient)
                .WithMany(p => p.documents)
                .HasForeignKey(d => d.patient_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Document optionally references a Tooth (SET NULL: deleting Tooth keeps Document but clears tooth_id)
            modelBuilder.Entity<Document>()
                .HasOne(d => d.tooth)
                .WithMany(t => t.documents)
                .HasForeignKey(d => d.tooth_id)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Document optionally references a Treatment (SET NULL: deleting Treatment keeps Document but clears treatment_id)
            modelBuilder.Entity<Document>()
                .HasOne(d => d.treatment)
                .WithMany(t => t.documents)
                .HasForeignKey(d => d.treatment_id)
                .OnDelete(DeleteBehavior.SetNull);
            
            // SaleItem belongs to a Patient (CASCADE: deleting Patient deletes their SaleItems)
            modelBuilder.Entity<SaleItem>()
                .HasOne(si => si.patient)
                .WithMany(p => p.sale_items)
                .HasForeignKey(si => si.patient_id)
                .OnDelete(DeleteBehavior.Cascade);
            
            // SaleItem optionally has a DiscountType (SET NULL: deleting DiscountType keeps SaleItem but clears discount_id)
            modelBuilder.Entity<SaleItem>()
                .HasOne(si => si.discount_type)
                .WithMany(dt => dt.sale_item)
                .HasForeignKey(si => si.discount_id)
                .OnDelete(DeleteBehavior.SetNull);
            
            // === DECIMAL PRECISION CONFIGURATIONS ===
            // Configure how decimal numbers are stored in the database
            // decimal(18,2) means: 18 total digits, with 2 digits after the decimal point
            // This is important for financial data to prevent rounding errors
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.total_amount)
                .HasColumnType("decimal(18,2)"); // Example: 9999999999999999.99
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.amount_paid)
                .HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<BillingLineItem>()
                .Property(bli => bli.unit_price)
                .HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<BillingLineItem>()
                .Property(bli => bli.discount_percentage)
                .HasColumnType("decimal(5,2)"); // Example: 100.00 (for percentages)
            
            modelBuilder.Entity<DiscountType>()
                .Property(dt => dt.discount_percentage)
                .HasColumnType("decimal(5,2)");
            
            modelBuilder.Entity<SaleItem>()
                .Property(si => si.cost)
                .HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<Payment>()
                .Property(p => p.amount)
                .HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<Service>()
                .Property(s => s.cost)
                .HasColumnType("decimal(18,2)");
            
            // === DEFAULT VALUES ===
            // These values are automatically set when creating new records if not specified
            
            modelBuilder.Entity<Staff>()
                .Property(s => s.is_active)
                .HasDefaultValue(true); // New staff members are active by default
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.total_amount)
                .HasDefaultValue(0.00m); // New bills start at $0.00
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.amount_paid)
                .HasDefaultValue(0.00m); // No payment made yet by default
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.status)
                .HasDefaultValue("Draft"); // New bills start as Draft
            
            modelBuilder.Entity<BillingLineItem>()
                .Property(bli => bli.quantity)
                .HasDefaultValue(1); // Default quantity is 1 item
            
            modelBuilder.Entity<BillingLineItem>()
                .Property(bli => bli.discount_percentage)
                .HasDefaultValue(0.00m); // No discount by default
            
            modelBuilder.Entity<Document>()
                .Property(d => d.is_sensitive)
                .HasDefaultValue(false); // Documents are not sensitive by default
            
            modelBuilder.Entity<Payment>()
                .Property(p => p.payment_date)
                .HasDefaultValueSql("NOW()"); // Payment date is automatically set to current time
            
            // === AUDIT TIMESTAMPS ===
            // Automatically track when records are created and updated
            
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // For all entities that inherit from BaseAuditableEntity
                if (typeof(BaseAuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    // Set CreatedAt to current timestamp when record is created
                    modelBuilder.Entity(entityType.ClrType)
                        .Property("CreatedAt")
                        .HasDefaultValueSql("NOW()");
                    
                    // Set UpdatedAt to current timestamp when record is created or modified
                    modelBuilder.Entity(entityType.ClrType)
                        .Property("UpdatedAt")
                        .HasDefaultValueSql("NOW()");
                }
            }
            
            // === DATA SEEDING ===
            modelBuilder.Entity<AppointmentStatus>().HasData(
                new AppointmentStatus { id = new Guid("cf063462-6a13-43d1-ac87-c18d161aa954"), name = "Scheduled" },
                new AppointmentStatus { id = new Guid("68727843-03b7-4cec-bbe4-ba837a1f398d"), name = "Confirmed" },
                new AppointmentStatus { id = new Guid("b43df020-3abd-442c-8b04-c70a2bc42062"), name = "Cancelled" },
                new AppointmentStatus { id = new Guid("0b01d9d2-5645-48d7-8ed8-edb1e9b8af5b"), name = "Completed" }
            );

            modelBuilder.Entity<DocumentType>().HasData(
                new DocumentType { id = new Guid("de3b98d3-9281-439c-a014-0d87e38cdb5a"), document_type_code = "XRAY", name = "X-Ray" },
                new DocumentType { id = new Guid("4ba01043-3d4d-440f-85ca-79f7c6fd52f2"), document_type_code = "CONSENT", name = "Consent Form" },
                new DocumentType { id = new Guid("e8a3bf49-f083-443e-9749-00f54f7bc4bb"), document_type_code = "OTHER", name = "Other" }
            );

            modelBuilder.Entity<DiscountType>().HasData(
                new DiscountType { id = new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"), discount_name = "Senior Citizen", discount_percentage = 10 },
                new DiscountType { id = new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"), discount_name = "Student", discount_percentage = 5 }
            );

            modelBuilder.Entity<Role>().HasData(
                new Role { id = new Guid("4c64b60f-eb58-4c28-b4ee-8d5bf850b3b6"), name = "Admin" },
                new Role { id = new Guid("c96127a9-12dd-4211-85ed-8079504231ca"), name = "Dentist" },
                new Role { id = new Guid("1160be54-0d90-425d-aae1-e30491121809"), name = "Receptionist" }
            );

            modelBuilder.Entity<ToothStatus>().HasData(
                new ToothStatus { id = new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"), code = "HEALTHY", description = "Healthy" },
                new ToothStatus { id = new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"), code = "CAVITY", description = "Cavity" },
                new ToothStatus { id = new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"), code = "MISSING", description = "Missing" },
                new ToothStatus { id = new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"), code = "OTHER", description = "Other" }
            );
        }

        public void SeedData()
        {
            // Idempotent, one-row-per-table seed. Respects FKs and required fields.
            var isRelational = Database.IsRelational();
            using var tx = isRelational ? Database.BeginTransaction() : null;
            var now = DateTime.UtcNow;

            // 1) Lookup/reference tables (create only if empty)
            if (!Role.Any())
            {
                Role.Add(new Role { id = Guid.NewGuid(), name = "Admin" });
                SaveChanges();
            }

            if (!Specialty.Any())
            {
                Specialty.Add(new Specialty { id = Guid.NewGuid(), name = "General Dentistry", description = "General practice" });
                SaveChanges();
            }

            if (!AppointmentStatus.Any())
            {
                AppointmentStatus.Add(new AppointmentStatus { id = Guid.NewGuid(), name = "Scheduled" });
                SaveChanges();
            }

            if (!ToothStatus.Any())
            {
                ToothStatus.Add(new ToothStatus { id = Guid.NewGuid(), code = "HEALTHY", description = "Healthy" });
                SaveChanges();
            }

            if (!DocumentType.Any())
            {
                DocumentType.Add(new DocumentType { id = Guid.NewGuid(), document_type_code = "OTHER", name = "Other" });
                SaveChanges();
            }

            if (!DiscountType.Any())
            {
                DiscountType.Add(new DiscountType { id = Guid.NewGuid(), discount_name = "None", discount_percentage = 0m, created_at = now, updated_at = now });
                SaveChanges();
            }

            if (!Service.Any())
            {
                var specialty = Specialty.First();
                Service.Add(new Service { id = Guid.NewGuid(), name = "Cleaning", description = "Basic cleaning", cost = 80m, specialty_id = specialty.id });
                SaveChanges();
            }

            // 2) Core person record (use the same person for Staff and Patient to keep one row in Person)
            Person person;
            if (!Person.Any())
            {
                person = new Person
                {
                    id = Guid.NewGuid(),
                    first_name = "Alex",
                    last_name = "Smith",
                    date_of_birth = now.AddYears(-30),
                    gender = "Other",
                    email = "alex.smith@example.com",
                    phone_number = "+10000000000",
                    address = "123 Seed St",
                    a_identifier = "PER-001",
                    created_at = now,
                    updated_at = now
                };
                Person.Add(person);
                SaveChanges();
            }
            else
            {
                person = Person.First();
            }

            // 3) Staff and Patient
            Staff staff;
            if (!Staff.Any())
            {
                var role = Role.First();
                var specialty = Specialty.FirstOrDefault();
                staff = new Staff
                {
                    id = Guid.NewGuid(),
                    person_id = person.id,
                    role_id = role.id,
                    specialty_id = specialty?.id,
                    license_number = "LIC-1001",
                    is_active = true,
                    created_at = now,
                    updated_at = now,
                    created_by = "seed",
                    updated_by = "seed"
                };
                Staff.Add(staff);
                SaveChanges();
            }
            else
            {
                staff = Staff.First();
            }

            Patient patient;
            if (!Patient.Any())
            {
                patient = new Patient
                {
                    id = Guid.NewGuid(),
                    person_id = person.id,
                    emergency_contact_name = "Jamie Seed",
                    emergency_contact_phone = "+10000000001",
                    created_at = now,
                    updated_at = now,
                    created_by = "seed",
                    updated_by = "seed",
                    Person = person
                };
                Patient.Add(patient);
                SaveChanges();
            }
            else
            {
                patient = Patient.First();
            }

            // 4) Tooth for the patient
            Tooth tooth;
            if (!Tooth.Any())
            {
                var toothStatus = ToothStatus.First();
                tooth = new Tooth
                {
                    id = Guid.NewGuid(),
                    patient_id = patient.id,
                    patient = patient,
                    tooth_number = 1,
                    tooth_name = "Tooth 1",
                    tooth_status_id = toothStatus.id,
                    tooth_status = toothStatus,
                    created_at = now,
                    updated_at = now
                };
                Tooth.Add(tooth);
                SaveChanges();
            }
            else
            {
                tooth = Tooth.First();
            }

            // 5) Appointment
            Appointment appointment;
            if (!Appointment.Any())
            {
                var status = AppointmentStatus.First();
                appointment = new Appointment
                {
                    id = Guid.NewGuid(),
                    patient_id = patient.id,
                    patient = patient,
                    staff_id = staff.id,
                    staff = staff,
                    status_id = status.id,
                    status = status,
                    appointment_start_time = now.AddDays(1),
                    duration_minutes = 30,
                    reason_for_visit = "Routine checkup",
                    notes = "Seeded appointment",
                    created_at = now,
                    updated_at = now
                };
                Appointment.Add(appointment);
                SaveChanges();
            }
            else
            {
                appointment = Appointment.First();
            }

            // 6) Treatment
            Treatment treatment;
            if (!Treatment.Any())
            {
                var service = Service.First();
                treatment = new Treatment
                {
                    id = Guid.NewGuid(),
                    appointment_id = appointment.id,
                    appointment = appointment,
                    patient_id = patient.id,
                    patient = patient,
                    staff_id = staff.id,
                    staff = staff,
                    service_id = service.id,
                    service = service,
                    tooth_id = tooth.id,
                    tooth = tooth,
                    notes = "Initial treatment",
                    created_at = now,
                    updated_at = now
                };
                Treatment.Add(treatment);
                SaveChanges();
            }
            else
            {
                treatment = Treatment.First();
            }

            // 7) Billing
            Billing billing;
            if (!Billing.Any())
            {
                billing = new Billing
                {
                    id = Guid.NewGuid(),
                    patient_id = patient.id,
                    issue_date = now.Date,
                    due_date = now.Date.AddDays(30),
                    total_amount = 100m,
                    amount_paid = 20m,
                    status = "Partial",
                    created_at = now,
                    updated_at = now,
                    created_by = "seed",
                    updated_by = "seed",
                    patient = patient,
                    billing_line_Item = new List<BillingLineItem>(),
                    payment = new List<Payment>()
                };
                Billing.Add(billing);
                SaveChanges();
            }
            else
            {
                billing = Billing.First();
            }

            // 8) BillingLineItem
            if (!BillingLineItem.Any())
            {
                BillingLineItem.Add(new BillingLineItem
                {
                    id = Guid.NewGuid(),
                    billing_id = billing.id,
                    billing = billing,
                    treatment_id = treatment.id,
                    treatment = treatment,
                    description = "Treatment charge",
                    quantity = 1,
                    unit_price = 100m,
                    discount_percentage = 0m,
                    created_at = now,
                    created_by = "seed"
                });
                SaveChanges();
            }

            // 9) Payment
            if (!Payment.Any())
            {
                Payment.Add(new Payment
                {
                    id = Guid.NewGuid(),
                    billing_id = billing.id,
                    billing = billing,
                    amount = 20m,
                    payment_date = now,
                    method = "CARD",
                    transaction_ref = "SEED-REF-1",
                    created_at = now,
                    created_by = "seed"
                });
                SaveChanges();
            }

            // 10) Document
            if (!Document.Any())
            {
                var docType = DocumentType.First();
                Document.Add(new Document
                {
                    id = Guid.NewGuid(),
                    patient_id = patient.id,
                    document_type_id = docType.id,
                    description = "Seed document",
                    document_path = "/var/seed/seed-doc.txt",
                    upload_date = now,
                    is_sensitive = false,
                    created_at = now,
                    updated_at = now,
                    tooth_id = tooth.id,
                    treatment_id = treatment.id
                });
                SaveChanges();
            }

            // 11) Sale Item
            if (!SaleItem.Any())
            {
                var discount = DiscountType.FirstOrDefault();
                SaleItem.Add(new SaleItem
                {
                    id = Guid.NewGuid(),
                    quantity = 1,
                    discount_id = discount?.id,
                    patient_id = patient.id,
                    cost = 50m,
                    created_at = now,
                    updated_at = now,
                    created_by = "seed",
                    updated_by = "seed"
                });
                SaveChanges();
            }

            // 12) Prescription
            if (!Prescription.Any())
            {
                Prescription.Add(new Prescription
                {
                    id = Guid.NewGuid(),
                    treatment_id = treatment.id,
                    treatment = treatment,
                    drug_name = "Ibuprofen",
                    dosage = "200mg",
                    instructions = "Take twice daily after meals",
                    created_at = now,
                    updated_at = now,
                    created_by = "seed",
                    updated_by = "seed"
                });
                SaveChanges();
            }

            if (isRelational)
            {
                tx!.Commit();
            }
        }
    }
}
