using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/teeth/{toothId}/surfaces")]
    [Authorize(Policy = "SupportOrAbove")]
    public class ToothSurfaceHistoryController : ControllerBase
    {
        private readonly IRepository<TreatmentToothSurface> _surfaceRepo;
        private readonly IRepository<Treatment> _treatmentRepo;
        private readonly IRepository<Service> _serviceRepo;

        public ToothSurfaceHistoryController(
            IRepository<TreatmentToothSurface> surfaceRepo,
            IRepository<Treatment> treatmentRepo,
            IRepository<Service> serviceRepo)
        {
            _surfaceRepo = surfaceRepo;
            _treatmentRepo = treatmentRepo;
            _serviceRepo = serviceRepo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SurfaceHistoryDTO>>> Get(Guid toothId)
        {
            var rows = await _surfaceRepo.GetAll()
                .Where(x => x.tooth_id == toothId)
                .ToListAsync();

            var treatmentIds = rows.Select(r => r.treatment_id).Distinct().ToList();
            var treatments = await _treatmentRepo.GetAll()
                .Include(t => t.service)
                .Where(t => treatmentIds.Contains(t.id))
                .ToListAsync();

            var bySurface = rows.GroupBy(r => r.surface?.ToUpper() ?? "?")
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.ToList());

            var result = new List<SurfaceHistoryDTO>();
            foreach (var kv in bySurface)
            {
                var list = new SurfaceHistoryDTO { surface = kv.Key };
                foreach (var r in kv.Value)
                {
                    var t = treatments.FirstOrDefault(z => z.id == r.treatment_id);
                    if (t == null) continue;
                    list.treatments.Add(new SurfaceTreatmentEntryDto
                    {
                        id = t.id,
                        service_name = t.service?.name ?? "Treatment",
                        status = t.status,
                        date = t.completed_at ?? t.created_at
                    });
                }
                // naive currentStatus inference: if any Completed with service result -> restoration
                list.currentStatus = list.treatments.Any(x => string.Equals(x.status, "Completed", StringComparison.OrdinalIgnoreCase)) ? "restoration" : null;
                result.Add(list);
            }

            return Ok(result);
        }
    }
}

