using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;
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
            
            // Map C# enums to PostgreSQL enum types
            modelBuilder.HasPostgresEnum<GenderEnum>();
            modelBuilder.HasPostgresEnum<BillStatusEnum>();
            modelBuilder.HasPostgresEnum<PaymentMethodEnum>();
            
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
            
            // === ENUM CONVERSIONS ===
            // Configure how enums are stored in the database (as strings instead of integers)
            // This makes the database more readable and prevents issues if enum values change
            
            modelBuilder.Entity<Person>()
                .Property(p => p.gender)
                .HasColumnType("gender_enum");
            
            modelBuilder.Entity<Billing>()
                .Property(b => b.status)
                .HasColumnType("bill_status_enum");
            
            modelBuilder.Entity<Payment>()
                .Property(p => p.method)
                .HasColumnType("payment_method_enum");
            
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
                .HasDefaultValue(BillStatusEnum.Draft); // New bills start as Draft
            
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
        }
    }
}
