using System;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.Entities;
using ClinicApi.Services.Implementations;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ClinicApi.Tests.Unit
{
    public class PerioServiceStatisticsTests
    {
        private DentalClinicContext CreateContext()
        {
            var opts = new DbContextOptionsBuilder<DentalClinicContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new DentalClinicContext(opts);
        }

        [Fact]
        public async Task GetStatistics_Computes_BOP_PD_CAL()
        {
            using var ctx = CreateContext();
            var perRepo = new Repository<PerioStatus>(ctx);
            var mRepo = new Repository<PerioMeasurement>(ctx);
            var patRepo = new Repository<Patient>(ctx);
            var staffRepo = new Repository<Staff>(ctx);

            var patient = new Patient { id = Guid.NewGuid(), person_id = Guid.NewGuid(), created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            var staff = new Staff { id = Guid.NewGuid(), person_id = Guid.NewGuid(), created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
            ctx.Patient.Add(patient);
            ctx.Staff.Add(staff);
            await ctx.SaveChangesAsync();

            var perioStatus = new PerioStatus
            {
                id = Guid.NewGuid(),
                patient_id = patient.id,
                staff_id = staff.id,
                examination_date = DateTime.UtcNow,
                patient = patient,
                staff = staff,
            };
            ctx.PerioStatus.Add(perioStatus);
            await ctx.SaveChangesAsync();

            // Add 6 measurements with half BOP=true, PD range and CAL
            for (int i = 0; i < 6; i++)
            {
                ctx.PerioMeasurement.Add(new PerioMeasurement
                {
                    id = Guid.NewGuid(), perio_status_id = perioStatus.id, perio_status = perioStatus,
                    tooth_number = 11, site_index = i,
                    pocket_depth = i % 3 + 3, // 3,4,5 values
                    clinical_attachment_level = i % 3 + 2,
                    gingival_margin = i % 2,
                    recession = i % 2,
                    bleeding_on_probing = (i % 2 == 0),
                    mobility = 0,
                    furcation = 0,
                });
            }
            await ctx.SaveChangesAsync();

            var svc = new PerioService(perRepo, mRepo, patRepo, staffRepo);
            var stats = await svc.GetStatisticsAsync(patient.id);

            stats.bop_percentage.Should().BeGreaterThan(0);
            stats.mean_pd.Should().BeGreaterThan(0);
            stats.mean_cal.Should().BeGreaterThan(0);
            stats.sites_over_4mm.Should().BeGreaterThan(0);
        }
    }
}

