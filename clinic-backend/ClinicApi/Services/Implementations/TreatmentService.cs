using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicApi.Data.Repositories;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using ClinicApi.Mappers;
using Microsoft.EntityFrameworkCore;

namespace ClinicApi.Services.Implementations
{
    public class TreatmentService : ITreatmentService
    {
        private readonly IRepository<Treatment> _treatmentRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IRepository<Patient> _patientRepository;
        private readonly IRepository<Staff> _staffRepository;
        private readonly IRepository<Service> _serviceRepository;
        private readonly IRepository<Tooth> _toothRepository;
        private readonly IRepository<ToothStatus> _toothStatusRepository;
        private readonly IRepository<Billing> _billingRepository;
        private readonly IRepository<BillingLineItem> _billingLineItemRepository;
        private readonly IRepository<SurfacePricingTier> _surfacePricingTierRepository;
        private readonly IRepository<TreatmentToothSurface> _treatmentToothSurfaceRepository;

        public TreatmentService(
            IRepository<Treatment> treatmentRepository,
            IRepository<Appointment> appointmentRepository,
            IRepository<Patient> patientRepository,
            IRepository<Staff> staffRepository,
            IRepository<Service> serviceRepository,
            IRepository<Tooth> toothRepository,
            IRepository<ToothStatus> toothStatusRepository,
            IRepository<Billing> billingRepository,
            IRepository<BillingLineItem> billingLineItemRepository,
            IRepository<SurfacePricingTier> surfacePricingTierRepository,
            IRepository<TreatmentToothSurface> treatmentToothSurfaceRepository)
        {
            _treatmentRepository = treatmentRepository;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _staffRepository = staffRepository;
            _serviceRepository = serviceRepository;
            _toothRepository = toothRepository;
            _toothStatusRepository = toothStatusRepository;
            _billingRepository = billingRepository;
            _billingLineItemRepository = billingLineItemRepository;
            _surfacePricingTierRepository = surfacePricingTierRepository;
            _treatmentToothSurfaceRepository = treatmentToothSurfaceRepository;
        }

        public async Task<IEnumerable<TreatmentDTO>> GetAllTreatmentsAsync(Guid? patientId = null)
        {
            IQueryable<Treatment> query = _treatmentRepository.GetAll()
                .Include(t => t.teeth)
                .Include(t => t.service)
                    .ThenInclude(s => s.resulting_tooth_status);

            if (patientId.HasValue)
            {
                query = query.Where(t => t.patient_id == patientId.Value);
            }

            var treatments = await query.ToListAsync();
            var visited = new HashSet<object>();
            return treatments.Select(t => TreatmentMapper.ToDto(t, visited)).ToList();
        }

        public async Task<TreatmentDTO> GetTreatmentByIdAsync(Guid id)
        {
            var treatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .Include(t => t.service)
                    .ThenInclude(s => s.resulting_tooth_status)
                .FirstOrDefaultAsync(t => t.id == id);
            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> CreateTreatmentAsync(TreatmentDTO treatmentDto)
        {
            if (!await _appointmentRepository.ExistsAsync(treatmentDto.appointment_id))
                throw new KeyNotFoundException("Appointment not found");

            if (!await _patientRepository.ExistsAsync(treatmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _staffRepository.ExistsAsync(treatmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");

            if (!await _serviceRepository.ExistsAsync(treatmentDto.service_id))
                throw new KeyNotFoundException("Service not found");

            // Optional: validate service allows requested scope if configured
            var requestedScope = ResolveScope(treatmentDto);
            var serviceWithScopes = await _serviceRepository
                .GetAll()
                .Include(s => s.tooth_scopes)
                .FirstOrDefaultAsync(s => s.id == treatmentDto.service_id);
            if (serviceWithScopes != null && serviceWithScopes.tooth_scopes != null &&
                serviceWithScopes.tooth_scopes.Count > 0)
            {
                var allowed = new HashSet<string>(serviceWithScopes.tooth_scopes.Select(ts => ts.tooth_scope));
                var scopeOk = allowed.Contains(requestedScope)
                              || (requestedScope == "MultipleTeeth" && allowed.Contains("SingleTooth"));
                if (!scopeOk)
                    throw new KeyNotFoundException($"Service does not support scope '{requestedScope}'");
            }

            // Build entity; resolve teeth based on scope and provided tooth ids/numbers
            var treatment = new Treatment
            {
                id = treatmentDto.id ?? Guid.NewGuid(),
                appointment_id = treatmentDto.appointment_id,
                patient_id = treatmentDto.patient_id,
                staff_id = treatmentDto.staff_id,
                service_id = treatmentDto.service_id,
                treatment_scope = requestedScope,
                status = "Planned",
                completed_at = null,
                notes = treatmentDto.notes,
                surfaces = treatmentDto.surfaces,
                appointment = null,
                patient = null,
                staff = null,
                service = null,
                prescriptions = new List<Prescription>(),
                billing_line_item = new List<BillingLineItem>(),
                documents = new List<Document>(),
                teeth = new List<Tooth>()
            };

            var targetToothIds = await ResolveToothIdsAsync(treatmentDto);
            if (treatment.treatment_scope == "NonTooth")
            {
                // No teeth linked
            }
            else if (treatment.treatment_scope == "FullMouth")
            {
                // Link all existing teeth for the patient
                var allTeeth = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id);
                foreach (var tooth in allTeeth)
                {
                    treatment.teeth.Add(tooth);
                }
            }
            else
            {
                // Single or Multiple using resolved list
                foreach (var tid in targetToothIds)
                {
                    var tooth = await _toothRepository.GetByIdAsync(tid);
                    if (tooth != null) treatment.teeth.Add(tooth);
                }
            }

            // Basic clinical validations to prevent conflicting statuses
            // 1) If surfaces provided (restorative), prevent on Missing/Extracted teeth
            if (!string.IsNullOrWhiteSpace(treatment.surfaces) && treatment.teeth.Any())
            {
                // Load tooth statuses
                var toothIds = treatment.teeth.Select(t => t.id).ToList();
                var teeth = await _toothRepository.GetAll()
                    .Include(t => t.tooth_status)
                    .Where(t => toothIds.Contains(t.id))
                    .ToListAsync();
                foreach (var tooth in teeth)
                {
                    var code = (tooth.tooth_status?.code ?? string.Empty).ToUpperInvariant();
                    if (code.Contains("MISSING") || code.Contains("EXTRACT"))
                    {
                        throw new InvalidOperationException("Cannot plan a surface-based procedure on a missing/extracted tooth.");
                    }
                }
            }

            // 2) Service-specific guardrails using visual_cue_code
            if (serviceWithScopes != null && !string.IsNullOrWhiteSpace(serviceWithScopes.visual_cue_code))
            {
                var cue = serviceWithScopes.visual_cue_code.ToUpperInvariant();
                if ((cue.Contains("BRIDGE") || cue.Contains("SPLINT")) && treatment.teeth.Count < 2)
                {
                    throw new InvalidOperationException("Bridge/Splint requires selecting at least two adjacent teeth.");
                }
                if (cue.Contains("ROOT_CANAL") && treatment.teeth.Any())
                {
                    // Disallow RCT on implants
                    var teeth = await _toothRepository.GetAll()
                        .Include(t => t.tooth_status)
                        .Where(t => treatment.teeth.Select(x => x.id).Contains(t.id))
                        .ToListAsync();
                    foreach (var tooth in teeth)
                    {
                        var code = (tooth.tooth_status?.code ?? string.Empty).ToUpperInvariant();
                        if (code.Contains("IMPLANT"))
                            throw new InvalidOperationException("Cannot perform root canal on an implant.");
                    }
                }
            }

            await _treatmentRepository.AddAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();

            // Create per-tooth surface rows if provided
            try
            {
                if (treatment.teeth.Any())
                {
                    // Build map: tooth_id -> list of surface codes
                    var toothIdByNumber = new Dictionary<int, Guid>();
                    foreach (var tooth in treatment.teeth)
                    {
                        if (!toothIdByNumber.ContainsKey(tooth.tooth_number))
                            toothIdByNumber[tooth.tooth_number] = tooth.id;
                    }

                    // Helper to normalize and expand a surfaces string (e.g., "MOD") to ["M","O","D"]
                    static List<string> ExpandSurfaces(string? s)
                    {
                        var list = new List<string>();
                        if (string.IsNullOrWhiteSpace(s)) return list;
                        foreach (var ch in s.Trim().ToUpperInvariant())
                        {
                            if ("MODBLCIF".Contains(ch)) list.Add(ch.ToString());
                            if (ch == 'C') list.Add("C"); // cervical
                        }
                        return list;
                    }

                    // If a surface_map was supplied (DTO), use that per tooth number
                    if (treatmentDto.surface_map != null && treatmentDto.surface_map.Count > 0)
                    {
                        foreach (var kvp in treatmentDto.surface_map)
                        {
                            var toothNum = kvp.Key;
                            if (!toothIdByNumber.TryGetValue(toothNum, out var toothId)) continue;
                            var codes = kvp.Value ?? new List<string>();
                            foreach (var code in codes)
                            {
                                var c = (code ?? string.Empty).Trim().ToUpperInvariant();
                                if (string.IsNullOrEmpty(c)) continue;
                                // Ensure required navs are set
                                var toothEntity = treatment.teeth.FirstOrDefault(t => t.id == toothId) ?? await _toothRepository.GetByIdAsync(toothId);
                                await _treatmentToothSurfaceRepository.AddAsync(new TreatmentToothSurface
                                {
                                    id = Guid.NewGuid(),
                                    treatment_id = treatment.id,
                                    tooth_id = toothId,
                                    surface = c,
                                    treatment = treatment,
                                    tooth = toothEntity!
                                });
                            }
                        }
                    }
                    else if (!string.IsNullOrWhiteSpace(treatment.surfaces))
                    {
                        // Apply the same surfaces to all linked teeth
                        var codes = ExpandSurfaces(treatment.surfaces);
                        foreach (var tooth in treatment.teeth)
                        {
                            foreach (var c in codes)
                            {
                                await _treatmentToothSurfaceRepository.AddAsync(new TreatmentToothSurface
                                {
                                    id = Guid.NewGuid(),
                                    treatment_id = treatment.id,
                                    tooth_id = tooth.id,
                                    surface = c,
                                    treatment = treatment,
                                    tooth = tooth
                                });
                            }
                        }
                    }

                    await _treatmentToothSurfaceRepository.SaveChangesAsync();
                }
            }
            catch
            {
                // Best-effort: do not fail treatment creation if surface rows fail; surfaces can be reconstructed later
            }

            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> CompleteTreatmentAsync(Guid id)
        {
            var treatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .Include(t => t.service)
                    .ThenInclude(s => s.resulting_tooth_status)
                .FirstOrDefaultAsync(t => t.id == id);

            if (treatment == null)
                throw new KeyNotFoundException("Treatment not found");

            if (treatment.status == "Completed")
                throw new InvalidOperationException("Treatment is already completed");

            if (treatment.status == "Cancelled")
                throw new InvalidOperationException("Cannot complete a cancelled treatment");

            // Mark treatment as completed
            treatment.status = "Completed";
            treatment.completed_at = DateTime.UtcNow;
            treatment.updated_at = DateTime.UtcNow;

            // Auto-update tooth status if the service has a resulting status
            if (treatment.service?.resulting_tooth_status_id != null)
            {
                var newStatusId = treatment.service.resulting_tooth_status_id.Value;

                foreach (var tooth in treatment.teeth)
                {
                    tooth.tooth_status_id = newStatusId;
                    tooth.updated_at = DateTime.UtcNow;
                    await _toothRepository.UpdateAsync(tooth);
                }
            }

            // Create BillingLineItem automatically
            if (treatment.service != null)
            {
                // Find draft billing for the patient today, or create one
                var today = DateTime.UtcNow.Date;
                var billing = await _billingRepository.GetAll()
                    .FirstOrDefaultAsync(b => b.patient_id == treatment.patient_id && b.status == "Draft" && b.issue_date == today);
                
                if (billing == null)
                {
                    billing = new Billing
                    {
                        patient_id = treatment.patient_id,
                        patient = treatment.patient,
                        issue_date = today,
                        due_date = today.AddDays(30),
                        status = "Draft",
                        total_amount = 0,
                        amount_paid = 0,
                        billing_line_Item = new List<BillingLineItem>(),
                        payment = new List<Payment>()
                    };
                    await _billingRepository.AddAsync(billing);
                }

                // Increase cost based on number of surfaces, or default service cost
                decimal cost = treatment.service.cost;
                // Determine number of surfaces for pricing tier
                int surfaceCount = 0;
                // Prefer persisted TreatmentToothSurface rows
                var tSurfaces = await _treatmentToothSurfaceRepository.FindAsync(s => s.treatment_id == treatment.id);
                if (tSurfaces != null && tSurfaces.Any())
                {
                    surfaceCount = tSurfaces
                        .GroupBy(r => r.tooth_id)
                        .Select(g => g.Count())
                        .DefaultIfEmpty(0)
                        .Max();
                }
                else if (!string.IsNullOrWhiteSpace(treatment.surfaces))
                {
                    surfaceCount = treatment.surfaces.Trim().Length;
                }
                if (surfaceCount > 0)
                {
                    // Lookup tier for service
                    var tiers = await _surfacePricingTierRepository.FindAsync(x => x.service_id == treatment.service_id);
                    var tier = tiers
                        .OrderBy(t => t.min_surfaces)
                        .ThenBy(t => t.max_surfaces)
                        .FirstOrDefault(t => surfaceCount >= t.min_surfaces && surfaceCount <= t.max_surfaces);
                    if (tier != null)
                    {
                        cost *= tier.multiplier;
                    }
                    else if (surfaceCount > 1)
                    {
                        // Fallback to legacy behavior if no tiers configured
                        cost *= 1.25m;
                    }
                }

                var surfacesText = string.IsNullOrWhiteSpace(treatment.surfaces) ? "" : $" ({treatment.surfaces})";
                var lineItem = new BillingLineItem
                {
                    billing_id = billing.id,
                    billing = billing,
                    treatment_id = treatment.id,
                    treatment = treatment,
                    service_id = treatment.service_id,
                    service = treatment.service,
                    line_item_type = "Service",
                    description = $"{treatment.service.name}{surfacesText} (Auto-generated)",
                    quantity = 1,
                    unit_price = cost,
                    discount_percentage = 0
                };

                await _billingLineItemRepository.AddAsync(lineItem);
                billing.total_amount += cost;
                await _billingRepository.UpdateAsync(billing);
            }

            await _treatmentRepository.UpdateAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> CancelTreatmentAsync(Guid id)
        {
            var treatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .Include(t => t.service)
                    .ThenInclude(s => s.resulting_tooth_status)
                .FirstOrDefaultAsync(t => t.id == id);

            if (treatment == null)
                throw new KeyNotFoundException("Treatment not found");

            if (treatment.status == "Completed")
                throw new InvalidOperationException("Cannot cancel a completed treatment");

            treatment.status = "Cancelled";
            treatment.updated_at = DateTime.UtcNow;

            await _treatmentRepository.UpdateAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(treatment, new HashSet<object>());
        }

        public async Task<TreatmentDTO> UpdateTreatmentAsync(Guid id, TreatmentDTO treatmentDto)
        {
            var existingTreatment = await _treatmentRepository
                .GetAll()
                .Include(t => t.teeth)
                .FirstOrDefaultAsync(t => t.id == id);
            if (existingTreatment == null)
                throw new KeyNotFoundException("Treatment not found");

            if (!await _appointmentRepository.ExistsAsync(treatmentDto.appointment_id))
                throw new KeyNotFoundException("Appointment not found");

            if (!await _patientRepository.ExistsAsync(treatmentDto.patient_id))
                throw new KeyNotFoundException("Patient not found");

            if (!await _staffRepository.ExistsAsync(treatmentDto.staff_id))
                throw new KeyNotFoundException("Staff not found");

            if (!await _serviceRepository.ExistsAsync(treatmentDto.service_id))
                throw new KeyNotFoundException("Service not found");

            // Manual update
            existingTreatment.appointment_id = treatmentDto.appointment_id;
            existingTreatment.patient_id = treatmentDto.patient_id;
            existingTreatment.staff_id = treatmentDto.staff_id;
            existingTreatment.service_id = treatmentDto.service_id;
            existingTreatment.treatment_scope = ResolveScope(treatmentDto);
            existingTreatment.notes = treatmentDto.notes;
            existingTreatment.surfaces = treatmentDto.surfaces;
            existingTreatment.updated_at = DateTime.UtcNow;

            // Update teeth links
            var newToothIds = await ResolveToothIdsAsync(treatmentDto);
            existingTreatment.teeth.Clear();
            if (existingTreatment.treatment_scope == "FullMouth")
            {
                var allTeeth = await _toothRepository.FindAsync(t => t.patient_id == treatmentDto.patient_id);
                foreach (var tooth in allTeeth) existingTreatment.teeth.Add(tooth);
            }
            else if (existingTreatment.treatment_scope != "NonTooth")
            {
                foreach (var tid in newToothIds)
                {
                    var tooth = await _toothRepository.GetByIdAsync(tid);
                    if (tooth != null) existingTreatment.teeth.Add(tooth);
                }
            }

            await _treatmentRepository.UpdateAsync(existingTreatment);
            await _treatmentRepository.SaveChangesAsync();

            return TreatmentMapper.ToDto(existingTreatment, new HashSet<object>());
        }

        public async Task<bool> DeleteTreatmentAsync(Guid id)
        {
            var treatment = await _treatmentRepository.GetByIdAsync(id);
            if (treatment == null)
                return false;

            await _treatmentRepository.DeleteAsync(treatment);
            await _treatmentRepository.SaveChangesAsync();
            return true;
        }

        // Helper methods for scope/tooth resolution
        private static string ResolveScope(TreatmentDTO dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.treatment_scope)) return dto.treatment_scope!;
            // Infer scope from provided tooth fields
            var hasMulti = (dto.tooth_ids != null && dto.tooth_ids.Count > 1) ||
                           (dto.tooth_numbers != null && dto.tooth_numbers.Count > 1);
            var hasSingle = (dto.tooth_id.HasValue && dto.tooth_id.Value != Guid.Empty) ||
                            (dto.tooth_number.HasValue) || (dto.tooth_ids != null && dto.tooth_ids.Count == 1) ||
                            (dto.tooth_numbers != null && dto.tooth_numbers.Count == 1);
            if (hasMulti) return "MultipleTeeth";
            if (hasSingle) return "SingleTooth";
            return "NonTooth"; // default if no tooth info
        }

        private async Task<List<Guid>> ResolveToothIdsAsync(TreatmentDTO dto)
        {
            var ids = new HashSet<Guid>();
            if (dto.tooth_id.HasValue && dto.tooth_id.Value != Guid.Empty)
            {
                ids.Add(dto.tooth_id.Value);
            }

            if (dto.tooth_ids != null)
            {
                foreach (var tid in dto.tooth_ids)
                    if (tid != Guid.Empty)
                        ids.Add(tid);
            }

            if (dto.tooth_number.HasValue)
            {
                var found = await _toothRepository.FindAsync(t =>
                    t.patient_id == dto.patient_id && t.tooth_number == dto.tooth_number.Value);
                var tooth = found.FirstOrDefault();
                if (tooth != null) ids.Add(tooth.id);
            }

            if (dto.tooth_numbers != null)
            {
                foreach (var n in dto.tooth_numbers)
                {
                    var found = await _toothRepository.FindAsync(t =>
                        t.patient_id == dto.patient_id && t.tooth_number == n);
                    var tooth = found.FirstOrDefault();
                    if (tooth != null) ids.Add(tooth.id);
                }
            }

            return ids.ToList();
        }
    }
}
    
