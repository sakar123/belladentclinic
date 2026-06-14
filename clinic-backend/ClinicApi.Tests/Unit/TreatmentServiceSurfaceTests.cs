using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Services.Implementations;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ClinicApi.Tests.Unit
{
    public class TreatmentServiceSurfaceTests
    {
        private DentalClinicContext CreateContext()
        {
            var opts = new DbContextOptionsBuilder<DentalClinicContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new DentalClinicContext(opts);
        }

        [Fact]
        public async Task CompleteTreatment_Applies_Surface_Pricing_Tier()
        {
            using var ctx = CreateContext();
            // Repositories
            var tRepo = new Repository<Treatment>(ctx);
            var apptRepo = new Repository<Appointment>(ctx);
            var patRepo = new Repository<Patient>(ctx);
            var staffRepo = new Repository<Staff>(ctx);
            var svcRepo = new Repository<Service>(ctx);
            var toothRepo = new Repository<Tooth>(ctx);
            var tsRepo = new Repository<ToothStatus>(ctx);
            var billRepo = new Repository<Billing>(ctx);
            var bliRepo = new Repository<BillingLineItem>(ctx);
            var tierRepo = new Repository<SurfacePricingTier>(ctx);
            var ttsRepo = new Repository<TreatmentToothSurface>(ctx);

            // Seed core entities
            var patient = new Patient { id = Guid.NewGuid(), person_id = Guid.NewGuid(), created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            var staff = new Staff { id = Guid.NewGuid(), person_id = Guid.NewGuid(), created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            var appt = new Appointment { id = Guid.NewGuid(), patient_id = patient.id, staff_id = staff.id, start_time = DateTime.UtcNow, end_time = DateTime.UtcNow.AddMinutes(30), status_id = Guid.NewGuid() };
            var service = new Service { id = Guid.NewGuid(), name = "Filling", cost = 100m };
            var toothStatus = new ToothStatus { id = Guid.NewGuid(), code = "HEALTHY" };
            var tooth = new Tooth { id = Guid.NewGuid(), patient_id = patient.id, tooth_number = 16, tooth_name = "Tooth 16", tooth_status_id = toothStatus.id, tooth_status = toothStatus, created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };

            ctx.Patient.Add(patient);
            ctx.Staff.Add(staff);
            ctx.Appointment.Add(appt);
            ctx.Service.Add(service);
            ctx.ToothStatus.Add(toothStatus);
            ctx.Tooth.Add(tooth);
            await ctx.SaveChangesAsync();

            // Treatment with surfaces (e.g., MOD => 3 surfaces)
            var tr = new Treatment
            {
                id = Guid.NewGuid(),
                appointment_id = appt.id,
                patient_id = patient.id,
                staff_id = staff.id,
                service_id = service.id,
                treatment_scope = "SingleTooth",
                status = "Planned",
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow,
                surfaces = "MOD",
                teeth = new List<Tooth> { tooth },
                service = service,
            };
            ctx.Treatment.Add(tr);
            // Create TreatmentToothSurface rows
            ctx.TreatmentToothSurface.Add(new TreatmentToothSurface { id = Guid.NewGuid(), treatment_id = tr.id, tooth_id = tooth.id, surface = "M", treatment = tr, tooth = tooth });
            ctx.TreatmentToothSurface.Add(new TreatmentToothSurface { id = Guid.NewGuid(), treatment_id = tr.id, tooth_id = tooth.id, surface = "O", treatment = tr, tooth = tooth });
            ctx.TreatmentToothSurface.Add(new TreatmentToothSurface { id = Guid.NewGuid(), treatment_id = tr.id, tooth_id = tooth.id, surface = "D", treatment = tr, tooth = tooth });

            // Surface pricing tiers (3 surfaces => 1.50x)
            ctx.SurfacePricingTier.Add(new SurfacePricingTier { id = Guid.NewGuid(), service_id = service.id, min_surfaces = 1, max_surfaces = 1, multiplier = 1.00m, service = service });
            ctx.SurfacePricingTier.Add(new SurfacePricingTier { id = Guid.NewGuid(), service_id = service.id, min_surfaces = 2, max_surfaces = 2, multiplier = 1.25m, service = service });
            ctx.SurfacePricingTier.Add(new SurfacePricingTier { id = Guid.NewGuid(), service_id = service.id, min_surfaces = 3, max_surfaces = 10, multiplier = 1.50m, service = service });

            await ctx.SaveChangesAsync();

            var svc = new TreatmentService(tRepo, apptRepo, patRepo, staffRepo, svcRepo, toothRepo, tsRepo, billRepo, bliRepo, tierRepo, ttsRepo);

            // Act
            var dto = await svc.CompleteTreatmentAsync(tr.id);

            // Assert billing line item created with multiplier 1.50 * 100 = 150
            var bli = ctx.BillingLineItem.FirstOrDefault(b => b.treatment_id == tr.id);
            bli.Should().NotBeNull();
            bli!.unit_price.Should().Be(150m);
        }
    }
}

