using ClinicApi.Models.Entities;
using ClinicApi.Models.Enumerations;
using Microsoft.EntityFrameworkCore;

namespace ClinicApi.Data
{
    public class DentalClinicContext : DbContext
    {
        public DentalClinicContext(DbContextOptions<DentalClinicContext> options)
            : base(options) { }

        // DbSets (keep these; EF will pick up configurations from IEntityTypeConfiguration)
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


        // ... other DbSets

        protected override void OnModelCreating(ModelBuilder modelBuilder)
	        {
	            base.OnModelCreating(modelBuilder);
	            // Configure UUID generation for all entities
	            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
	            {
					entityType.SetTableName(entityType.GetTableName()!.ToLower());
	                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
					{
						modelBuilder.Entity(entityType.ClrType)
							.Property("Id")
							.HasDefaultValueSql("uuid_generate_v4()");
					}
	            }
	            // Configure enum conversions
	            modelBuilder.Entity<Person>()
	                .Property(p => p.gender)
	                .HasConversion<string>();
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.status)
	                .HasConversion<string>();
	            modelBuilder.Entity<Payment>()
	                .Property(p => p.method)
	                .HasConversion<string>();
	            // Configure relationships with cascade delete behavior
	            modelBuilder.Entity<Staff>()
	                .HasOne(s => s.person)
	                .WithOne()
	                .HasForeignKey<Staff>(s => s.person_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Patient>()
	                .HasOne(p => p.Person)
	                .WithOne()
	                .HasForeignKey<Patient>(p => p.person_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            // Configure unique constraints
	            modelBuilder.Entity<Tooth>()
	                .HasIndex(t => new { t.patient_id, t.tooth_number })
	                .IsUnique();
	            // Configure relationships with restrict delete behavior to prevent orphaned records
	            modelBuilder.Entity<Document>()
	                .HasOne(d => d.document_type)
	                .WithMany(dt => dt.documents)
	                .HasForeignKey(d => d.document_type_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            modelBuilder.Entity<Billing>()
	                .HasOne(b => b.patient)
	                .WithMany(p => p.billings)
	                .HasForeignKey(b => b.patient_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            modelBuilder.Entity<Treatment>()
	                .HasOne(t => t.appointment)
	                .WithMany(a => a.treatments)
	                .HasForeignKey(t => t.appointment_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            modelBuilder.Entity<Treatment>()
	                .HasOne(t => t.patient)
	                .WithMany(p => p.treatments)
	                .HasForeignKey(t => t.patient_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            modelBuilder.Entity<Treatment>()
	                .HasOne(t => t.staff)
	                .WithMany(s => s.treatments)
	                .HasForeignKey(t => t.staff_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            modelBuilder.Entity<Treatment>()
	                .HasOne(t => t.service)
	                .WithMany(s => s.treatments)
	                .HasForeignKey(t => t.service_id)
	                .OnDelete(DeleteBehavior.Restrict);
	            // Configure relationships with cascade delete where appropriate
	            modelBuilder.Entity<Appointment>()
	                .HasOne(a => a.patient)
	                .WithMany(p => p.appointments)
	                .HasForeignKey(a => a.patient_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Appointment>()
	                .HasOne(a => a.staff)
	                .WithMany(s => s.appointments)
	                .HasForeignKey(a => a.staff_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Appointment>()
	                .HasOne(a => a.status)
	                .WithMany(s => s.appointments)
	                .HasForeignKey(a => a.status_id)
	                .OnDelete(DeleteBehavior.Cascade);
					  modelBuilder.Entity<AppointmentStatus>(entity =>
				modelBuilder.Entity<AppointmentStatus>(entity =>  
				{
					// Ensure the 'name' field is unique
					entity.HasIndex(e => e.name).IsUnique();

				}));

				modelBuilder.Entity<ToothStatus>(entity =>
				{
					// Ensure the 'code' field is unique
					entity.HasIndex(e => e.code).IsUnique();
				});
	            // Configure many-to-many relationships through join tables
			modelBuilder.Entity<Prescription>()
	                .HasOne(p => p.treatment)
	                .WithMany(t => t.prescriptions)
	                .HasForeignKey(p => p.treatment_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<BillingLineItem>()
	                .HasOne(bli => bli.billing)
	                .WithMany(b => b.billing_line_Item)
	                .HasForeignKey(bli => bli.billing_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<BillingLineItem>()
	                .HasOne(bli => bli.treatment)
	                .WithMany(t => t.billing_line_item)
	                .HasForeignKey(bli => bli.treatment_id)
	                .OnDelete(DeleteBehavior.SetNull);
	            modelBuilder.Entity<Payment>()
	                .HasOne(p => p.billing)
	                .WithMany(b => b.payment)
	                .HasForeignKey(p => p.billing_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Tooth>()
	                .HasOne(t => t.patient)
	                .WithMany(p => p.teeth)
	                .HasForeignKey(t => t.patient_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Tooth>()
	                .HasOne(t => t.tooth_status)
	                .WithMany(ts => ts.teeth)
	                .HasForeignKey(t => t.tooth_status_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Document>()
	                .HasOne(d => d.patient)
	                .WithMany(p => p.documents)
	                .HasForeignKey(d => d.patient_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<Document>()
	                .HasOne(d => d.tooth)
	                .WithMany(t => t.documents)
	                .HasForeignKey(d => d.tooth_id)
	                .OnDelete(DeleteBehavior.SetNull);
	            modelBuilder.Entity<Document>()
	                .HasOne(d => d.treatment)
	                .WithMany(t => t.documents)
	                .HasForeignKey(d => d.treatment_id)
	                .OnDelete(DeleteBehavior.SetNull);
	            modelBuilder.Entity<SaleItem>()
	                .HasOne(si => si.patient)
	                .WithMany(p => p.sale_items)
	                .HasForeignKey(si => si.patient_id)
	                .OnDelete(DeleteBehavior.Cascade);
	            modelBuilder.Entity<SaleItem>()
	                .HasOne(si => si.discount_type)
	                .WithMany(dt => dt.sale_item)
	                .HasForeignKey(si => si.discount_id)
	                .OnDelete(DeleteBehavior.SetNull);
	            // Configure decimal precision for financial fields
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.total_amount)
	                .HasColumnType("decimal(18,2)");
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.amount_paid)
	                .HasColumnType("decimal(18,2)");
	            modelBuilder.Entity<BillingLineItem>()
	                .Property(bli => bli.unit_price)
	                .HasColumnType("decimal(18,2)");
	            modelBuilder.Entity<BillingLineItem>()
	                .Property(bli => bli.discount_percentage)
	                .HasColumnType("decimal(5,2)");
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
	            // Configure default values
	            modelBuilder.Entity<Staff>()
	                .Property(s => s.is_active)	
	                .HasDefaultValue(true);
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.total_amount)
	                .HasDefaultValue(0.00m);
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.amount_paid)
	                .HasDefaultValue(0.00m);
	            modelBuilder.Entity<Billing>()
	                .Property(b => b.status)
	                .HasDefaultValue(BillStatusEnum.Draft);
	            modelBuilder.Entity<BillingLineItem>()
	                .Property(bli => bli.quantity)
	                .HasDefaultValue(1);
	            modelBuilder.Entity<BillingLineItem>()
	                .Property(bli =>bli.discount_percentage)
	                .HasDefaultValue(0.00m);
	            modelBuilder.Entity<Document>()
	                .Property(d => d.is_sensitive)
	                .HasDefaultValue(false);
	            modelBuilder.Entity<Payment>()
	                .Property(p => p.payment_date)
	                .HasDefaultValueSql("NOW()");
	            // Configure audit timestamps
	            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
	            {
	                if (typeof(BaseAuditableEntity).IsAssignableFrom(entityType.ClrType))
	                {
	                    modelBuilder.Entity(entityType.ClrType)
	                        .Property("CreatedAt")
	                        .HasDefaultValueSql("NOW()");
	                    modelBuilder.Entity(entityType.ClrType)
	                        .Property("UpdatedAt")
	                        .HasDefaultValueSql("NOW()");
	                }
	            }
	        }
	    }
	}
