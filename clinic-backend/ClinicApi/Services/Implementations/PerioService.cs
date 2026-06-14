using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services.Implementations
{
    public class PerioService : IPerioService
    {
        private readonly IRepository<PerioStatus> _perioStatusRepo;
        private readonly IRepository<PerioMeasurement> _perioMeasurementRepo;
        private readonly IRepository<Patient> _patientRepo;
        private readonly IRepository<Staff> _staffRepo;

        public PerioService(
            IRepository<PerioStatus> perioStatusRepo,
            IRepository<PerioMeasurement> perioMeasurementRepo,
            IRepository<Patient> patientRepo,
            IRepository<Staff> staffRepo)
        {
            _perioStatusRepo = perioStatusRepo;
            _perioMeasurementRepo = perioMeasurementRepo;
            _patientRepo = patientRepo;
            _staffRepo = staffRepo;
        }

        public async Task<PerioStatusDTO?> GetLatestAsync(Guid patientId)
        {
            var latest = await _perioStatusRepo.GetAll()
                .Include(p => p.measurements)
                .Where(p => p.patient_id == patientId)
                .OrderByDescending(p => p.examination_date)
                .FirstOrDefaultAsync();
            if (latest == null) return null;
            return Map(latest);
        }

        public async Task<PerioStatusDTO> CreateAsync(CreatePerioRequest request)
        {
            if (!await _patientRepo.ExistsAsync(request.patient_id))
                throw new KeyNotFoundException("Patient not found");
            if (!await _staffRepo.ExistsAsync(request.staff_id))
                throw new KeyNotFoundException("Staff not found");

            // Load required navs to satisfy required members
            var patient = await _patientRepo.GetByIdAsync(request.patient_id);
            var staff = await _staffRepo.GetByIdAsync(request.staff_id);

            var status = new PerioStatus
            {
                id = Guid.NewGuid(),
                patient_id = request.patient_id,
                staff_id = request.staff_id,
                examination_date = request.examination_date?.ToUniversalTime() ?? DateTime.UtcNow,
                smoker = request.smoker,
                bone_loss = request.bone_loss,
                patient = patient!,
                staff = staff!,
            };

            await _perioStatusRepo.AddAsync(status);
            await _perioStatusRepo.SaveChangesAsync();

            foreach (var m in request.measurements)
            {
                var pm = new PerioMeasurement
                {
                    id = Guid.NewGuid(),
                    perio_status_id = status.id,
                    tooth_number = m.tooth_number,
                    site_index = m.site_index,
                    pocket_depth = m.pocket_depth,
                    clinical_attachment_level = m.clinical_attachment_level,
                    gingival_margin = m.gingival_margin,
                    recession = m.recession,
                    bleeding_on_probing = m.bleeding_on_probing,
                    mobility = m.mobility,
                    furcation = m.furcation,
                    perio_status = status,
                };
                await _perioMeasurementRepo.AddAsync(pm);
            }
            await _perioMeasurementRepo.SaveChangesAsync();

            // Eager load created
            var created = await _perioStatusRepo.GetAll()
                .Include(p => p.measurements)
                .FirstAsync(p => p.id == status.id);
            return Map(created);
        }

        private static PerioStatusDTO Map(PerioStatus entity)
        {
            return new PerioStatusDTO
            {
                id = entity.id,
                patient_id = entity.patient_id,
                staff_id = entity.staff_id,
                examination_date = entity.examination_date,
                smoker = entity.smoker,
                bone_loss = entity.bone_loss,
                measurements = entity.measurements
                    .OrderBy(m => m.tooth_number)
                    .ThenBy(m => m.site_index)
                    .Select(m => new PerioMeasurementDTO
                    {
                        id = m.id,
                        tooth_number = m.tooth_number,
                        site_index = m.site_index,
                        pocket_depth = m.pocket_depth,
                        clinical_attachment_level = m.clinical_attachment_level,
                        gingival_margin = m.gingival_margin,
                        recession = m.recession,
                        bleeding_on_probing = m.bleeding_on_probing,
                        mobility = m.mobility,
                        furcation = m.furcation
                    }).ToList()
            };
        }

        public async Task<PerioStatisticsDTO> GetStatisticsAsync(Guid patientId)
        {
            var latest = await _perioStatusRepo.GetAll()
                .Include(p => p.measurements)
                .Where(p => p.patient_id == patientId)
                .OrderByDescending(p => p.examination_date)
                .FirstOrDefaultAsync();
            var stats = new PerioStatisticsDTO();
            if (latest == null || latest.measurements == null || latest.measurements.Count == 0)
                return stats;

            var ms = latest.measurements;
            int totalSites = ms.Count;
            int bopSites = ms.Count(m => m.bleeding_on_probing);
            stats.bop_percentage = totalSites > 0 ? (bopSites * 100.0) / totalSites : 0.0;
            stats.mean_pd = totalSites > 0 ? ms.Average(m => m.pocket_depth) : 0.0;
            stats.mean_cal = totalSites > 0 ? ms.Average(m => m.clinical_attachment_level) : 0.0;
            stats.sites_over_4mm = ms.Count(m => m.pocket_depth >= 4);
            stats.sites_over_6mm = ms.Count(m => m.pocket_depth >= 6);
            return stats;
        }
    }
}
