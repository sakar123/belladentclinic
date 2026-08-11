using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Mappers;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;

namespace ClinicApi.Services.Implementations
{
    public class OdontogramConcurrencyException : Exception
    {
        public OdontogramConcurrencyException(string message) : base(message) { }
    }

    public class OdontogramValidationException : Exception
    {
        public OdontogramValidationException(string message) : base(message) { }
    }

    public class OdontogramSchemaUnavailableException : Exception
    {
        public OdontogramSchemaUnavailableException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class AdvancedOdontogramService : IAdvancedOdontogramService
    {
        private const int SchemaVersion = 1;
        private const int MaxChartPayloadBytes = 1_000_000;
        private const string DefaultSourceVersion = "react-advanced-odontogram@2.2.0";
        private const string MissingSchemaMessage = "Odontogram persistence tables are not available. Apply the latest database migration to enable full odontogram state persistence.";

        private readonly DentalClinicContext _context;
        private readonly IAdvancedOdontogramMapper _mapper;
        private readonly ITreatmentService _treatmentService;

        public AdvancedOdontogramService(
            DentalClinicContext context,
            IAdvancedOdontogramMapper mapper,
            ITreatmentService treatmentService)
        {
            _context = context;
            _mapper = mapper;
            _treatmentService = treatmentService;
        }

        public async Task<AdvancedOdontogramStateDTO> GetStateAsync(Guid patientId)
        {
            var patient = await LoadPatientAsync(patientId);
            var teeth = await LoadTeethAsync(patientId);
            PatientOdontogramSnapshot? snapshot = null;
            var compatibilityMode = false;
            string? compatibilityReason = null;

            try
            {
                snapshot = await _context.PatientOdontogramSnapshot.AsNoTracking().FirstOrDefaultAsync(s => s.patient_id == patientId);
            }
            catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
            {
                compatibilityMode = true;
                compatibilityReason = MissingSchemaMessage;
            }

            var charts = _mapper.BuildCharts(patient, teeth, snapshot);
            var treatments = await LoadTreatmentsAsync(patientId);
            var latestPerio = await LoadLatestPerioAsync(patientId);
            var planItems = new List<OdontogramPlanItem>();
            if (!compatibilityMode)
            {
                try
                {
                    planItems = await LoadPlanItemsAsync(patientId);
                }
                catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
                {
                    compatibilityMode = true;
                    compatibilityReason = MissingSchemaMessage;
                }
            }

            string rowVersion;
            if (compatibilityMode)
            {
                rowVersion = BuildCompatibilityRowVersion(patientId, teeth);
            }
            else
            {
                try
                {
                    rowVersion = await BuildCurrentRowVersionAsync(patientId);
                }
                catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
                {
                    compatibilityMode = true;
                    compatibilityReason = MissingSchemaMessage;
                    rowVersion = BuildCompatibilityRowVersion(patientId, teeth);
                }
            }

            return new AdvancedOdontogramStateDTO
            {
                patient_id = patientId,
                source_version = snapshot?.source_version ?? DefaultSourceVersion,
                schema_version = SchemaVersion,
                row_version = rowVersion,
                status_chart = charts.StatusChart,
                plan_chart = charts.PlanChart,
                teeth = teeth.Select(t => ToothMapper.ToDto(t, new HashSet<object>())).ToList(),
                treatments = treatments.Select(t => TreatmentMapper.ToDto(t, new HashSet<object>())).ToList(),
                latest_perio = latestPerio,
                plan_items = planItems.Select(ToDto).ToList(),
                compatibility_mode = compatibilityMode ? "schema-unavailable" : null,
                compatibility_reason = compatibilityReason
            };
        }

        public async Task<AdvancedOdontogramStateDTO> SaveStateAsync(Guid patientId, SaveAdvancedOdontogramStateRequest request, string? ifMatch, string? userKey)
        {
            ValidateChart(request.status_chart, "status_chart");
            ValidateChart(request.plan_chart, "plan_chart");

            string currentVersion;
            try
            {
                currentVersion = await BuildCurrentRowVersionAsync(patientId);
            }
            catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
            {
                throw new OdontogramSchemaUnavailableException(MissingSchemaMessage, ex);
            }
            var expected = NormalizeIfMatch(ifMatch);
            if (!string.IsNullOrWhiteSpace(expected) && expected != "*" && !string.Equals(expected, currentVersion, StringComparison.Ordinal))
            {
                throw new OdontogramConcurrencyException("Odontogram state has changed. Reload before saving again.");
            }

            IDbContextTransaction? tx = null;
            if (_context.Database.IsRelational())
            {
                tx = await _context.Database.BeginTransactionAsync();
            }

            try
            {
                var patient = await LoadPatientAsync(patientId);
                var teeth = await LoadTeethAsync(patientId, tracking: true);
                var sourceVersion = string.IsNullOrWhiteSpace(request.source_version) ? DefaultSourceVersion : request.source_version!.Trim();
                var now = DateTime.UtcNow;
                await UpsertSnapshotAsync(patientId, request, sourceVersion, now, userKey);

                var parsedStatus = _mapper.ParseChart(patientId, "Status", request.status_chart, teeth, patient);
                var parsedPlan = _mapper.ParseChart(patientId, "Plan", request.plan_chart, teeth, patient);
                await UpsertParsedStatesAsync(patientId, "Status", parsedStatus, now, userKey);
                await UpsertParsedStatesAsync(patientId, "Plan", parsedPlan, now, userKey);
                await ProjectStatusChartAsync(patient, teeth, parsedStatus, now);
                await ReplaceDraftPlanItemsAsync(patientId, request.plan_changes, request.plan_chart, parsedPlan, now, userKey);
                await AddAuditAsync(patientId, "odontogram-state-saved", new
                {
                    source_version = sourceVersion,
                    status_teeth = parsedStatus.Count,
                    plan_teeth = parsedPlan.Count,
                    plan_changes = request.plan_changes.Count,
                    client_saved_at = request.client_saved_at
                }, userKey);

                await _context.SaveChangesAsync();
                if (tx != null)
                {
                    await tx.CommitAsync();
                }
            }
            catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
            {
                if (tx != null)
                {
                    await tx.RollbackAsync();
                }
                throw new OdontogramSchemaUnavailableException(MissingSchemaMessage, ex);
            }
            catch
            {
                if (tx != null)
                {
                    await tx.RollbackAsync();
                }
                throw;
            }
            finally
            {
                if (tx != null)
                {
                    await tx.DisposeAsync();
                }
            }

            return await GetStateAsync(patientId);
        }

        public async Task<AdvancedOdontogramStateDTO> CommitPlanAsync(Guid patientId, CommitOdontogramPlanRequest request, string? userKey)
        {
            try
            {
                if (request.plan_item_ids.Count == 0)
                {
                    throw new OdontogramValidationException("Select at least one plan item to commit.");
                }

                if (!await _context.Appointment.AnyAsync(a => a.id == request.appointment_id && a.patient_id == patientId))
                {
                    throw new KeyNotFoundException("Appointment not found for this patient.");
                }

                if (!await _context.Staff.AnyAsync(s => s.id == request.staff_id))
                {
                    throw new KeyNotFoundException("Staff not found.");
                }

                var planItems = await _context.OdontogramPlanItem
                    .Where(p => p.patient_id == patientId && request.plan_item_ids.Contains(p.id) && p.status == "Draft")
                    .ToListAsync();

                if (planItems.Count == 0)
                {
                    throw new OdontogramValidationException("No draft plan items found to commit.");
                }

                foreach (var item in planItems)
                {
                    if (!item.proposed_service_id.HasValue)
                    {
                        throw new OdontogramValidationException($"Plan item '{item.axis}' needs a service before it can be committed.");
                    }
                }

                var createdTreatments = new List<TreatmentDTO>();
                var groups = planItems.GroupBy(item => IsBridgeLike(item) ? $"bridge:{item.proposed_service_id}" : item.id.ToString());
                foreach (var group in groups)
                {
                    var items = group.ToList();
                    var toothNumbers = items
                        .Select(i => i.backend_tooth_number)
                        .Where(n => n.HasValue)
                        .Select(n => n!.Value)
                        .Distinct()
                        .ToList();
                    var serviceId = items.First().proposed_service_id!.Value;
                    var surfaceMap = items
                        .Where(i => i.backend_tooth_number.HasValue && !string.IsNullOrWhiteSpace(i.proposed_surfaces))
                        .ToDictionary(i => i.backend_tooth_number!.Value, i => SplitSurfaces(i.proposed_surfaces));
                    var surfaces = string.Concat(surfaceMap.Values.SelectMany(v => v).Distinct(StringComparer.OrdinalIgnoreCase));
                    var treatment = await _treatmentService.CreateTreatmentAsync(new TreatmentDTO
                    {
                        appointment_id = request.appointment_id,
                        patient_id = patientId,
                        staff_id = request.staff_id,
                        service_id = serviceId,
                        treatment_scope = toothNumbers.Count switch
                        {
                            0 => "NonTooth",
                            1 => "SingleTooth",
                            _ => "MultipleTeeth"
                        },
                        tooth_number = toothNumbers.Count == 1 ? toothNumbers[0] : null,
                        tooth_numbers = toothNumbers.Count > 1 ? toothNumbers : null,
                        surfaces = string.IsNullOrWhiteSpace(surfaces) ? null : surfaces,
                        surface_map = surfaceMap.Count > 0 ? surfaceMap : null,
                        status = NormalizeDefaultStatus(request.default_status),
                        notes = $"Committed from odontogram plan: {string.Join(", ", items.Select(i => i.axis).Distinct())}"
                    });
                    createdTreatments.Add(treatment);

                    foreach (var item in items)
                    {
                        item.status = "Committed";
                        item.appointment_id = request.appointment_id;
                        item.treatment_id = treatment.id;
                        item.updated_at = DateTime.UtcNow;
                        item.updated_by = userKey;
                    }
                }

                await AddAuditAsync(patientId, "odontogram-plan-committed", new
                {
                    appointment_id = request.appointment_id,
                    staff_id = request.staff_id,
                    plan_item_ids = request.plan_item_ids,
                    treatment_ids = createdTreatments.Select(t => t.id)
                }, userKey);
                await _context.SaveChangesAsync();

                return await GetStateAsync(patientId);
            }
            catch (Exception ex) when (IsMissingOdontogramPersistenceTable(ex))
            {
                throw new OdontogramSchemaUnavailableException(MissingSchemaMessage, ex);
            }
        }

        public async Task<OdontogramPlanItemDTO> DismissPlanItemAsync(Guid patientId, Guid planItemId, string? userKey)
        {
            var item = await _context.OdontogramPlanItem
                .Include(p => p.proposed_service)
                .FirstOrDefaultAsync(p => p.patient_id == patientId && p.id == planItemId);
            if (item == null)
            {
                throw new KeyNotFoundException("Plan item not found.");
            }

            item.status = "Dismissed";
            item.updated_at = DateTime.UtcNow;
            item.updated_by = userKey;
            await AddAuditAsync(patientId, "odontogram-plan-dismissed", new { plan_item_id = planItemId }, userKey);
            await _context.SaveChangesAsync();

            return ToDto(item);
        }

        private async Task<Patient> LoadPatientAsync(Guid patientId)
        {
            var patient = await _context.Patient
                .Include(p => p.Person)
                .FirstOrDefaultAsync(p => p.id == patientId);

            return patient ?? throw new KeyNotFoundException("Patient not found.");
        }

        private async Task<List<Tooth>> LoadTeethAsync(Guid patientId, bool tracking = false)
        {
            var query = _context.Tooth
                .Include(t => t.tooth_status)
                .Where(t => t.patient_id == patientId);
            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            return await query.OrderBy(t => t.tooth_number).ToListAsync();
        }

        private async Task<List<Treatment>> LoadTreatmentsAsync(Guid patientId)
        {
            return await _context.Treatment
                .AsNoTracking()
                .Include(t => t.teeth)
                .Include(t => t.service)
                    .ThenInclude(s => s.resulting_tooth_status)
                .Where(t => t.patient_id == patientId)
                .OrderByDescending(t => t.created_at)
                .ToListAsync();
        }

        private async Task<PerioStatusDTO?> LoadLatestPerioAsync(Guid patientId)
        {
            var latest = await _context.PerioStatus
                .AsNoTracking()
                .Include(p => p.measurements)
                .Where(p => p.patient_id == patientId)
                .OrderByDescending(p => p.examination_date)
                .FirstOrDefaultAsync();

            if (latest == null)
            {
                return null;
            }

            return new PerioStatusDTO
            {
                id = latest.id,
                patient_id = latest.patient_id,
                staff_id = latest.staff_id,
                examination_date = latest.examination_date,
                smoker = latest.smoker,
                bone_loss = latest.bone_loss,
                measurements = latest.measurements
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
                    })
                    .ToList()
            };
        }

        private async Task<List<OdontogramPlanItem>> LoadPlanItemsAsync(Guid patientId)
        {
            return await _context.OdontogramPlanItem
                .AsNoTracking()
                .Include(p => p.proposed_service)
                .Where(p => p.patient_id == patientId && p.status != "Dismissed")
                .OrderBy(p => p.created_at)
                .ToListAsync();
        }

        private async Task UpsertSnapshotAsync(Guid patientId, SaveAdvancedOdontogramStateRequest request, string sourceVersion, DateTime now, string? userKey)
        {
            var snapshotPayload = JsonSerializer.Serialize(new
            {
                statusChart = JsonSerializer.Deserialize<JsonElement>(request.status_chart.GetRawText()),
                planChart = JsonSerializer.Deserialize<JsonElement>(request.plan_chart.GetRawText()),
                _clinic = new
                {
                    provider = "react-advanced-odontogram",
                    sourceVersion,
                    schemaVersion = SchemaVersion,
                    savedAt = now,
                    clientSavedAt = request.client_saved_at
                }
            });

            var snapshot = await _context.PatientOdontogramSnapshot.FirstOrDefaultAsync(s => s.patient_id == patientId);
            if (snapshot == null)
            {
                snapshot = new PatientOdontogramSnapshot
                {
                    id = Guid.NewGuid(),
                    patient_id = patientId,
                    payload = snapshotPayload,
                    source_version = sourceVersion,
                    created_at = now,
                    updated_at = now,
                    created_by = userKey,
                    updated_by = userKey
                };
                await _context.PatientOdontogramSnapshot.AddAsync(snapshot);
            }
            else
            {
                snapshot.payload = snapshotPayload;
                snapshot.source_version = sourceVersion;
                snapshot.updated_at = now;
                snapshot.updated_by = userKey;
            }
        }

        private async Task UpsertParsedStatesAsync(Guid patientId, string chartKind, IReadOnlyList<ParsedOdontogramToothState> parsedStates, DateTime now, string? userKey)
        {
            var existing = await _context.OdontogramToothState
                .Where(s => s.patient_id == patientId && s.chart_kind == chartKind)
                .ToListAsync();
            var existingByNumber = existing.ToDictionary(s => s.backend_tooth_number);
            var parsedNumbers = parsedStates.Select(s => s.BackendToothNumber).ToHashSet();

            foreach (var state in parsedStates)
            {
                if (!existingByNumber.TryGetValue(state.BackendToothNumber, out var row))
                {
                    row = new OdontogramToothState
                    {
                        id = Guid.NewGuid(),
                        patient_id = patientId,
                        tooth_id = state.ToothId,
                        backend_tooth_number = state.BackendToothNumber,
                        advanced_tooth_number = state.AdvancedToothNumber,
                        chart_kind = chartKind,
                        state_json = state.StateJson,
                        state_hash = state.StateHash,
                        note = state.Note,
                        created_at = now,
                        updated_at = now,
                        updated_by = userKey
                    };
                    await _context.OdontogramToothState.AddAsync(row);
                }
                else
                {
                    row.tooth_id = state.ToothId;
                    row.advanced_tooth_number = state.AdvancedToothNumber;
                    row.state_json = state.StateJson;
                    row.state_hash = state.StateHash;
                    row.note = state.Note;
                    row.updated_at = now;
                    row.updated_by = userKey;
                }
            }

            foreach (var stale in existing.Where(s => !parsedNumbers.Contains(s.backend_tooth_number)))
            {
                _context.OdontogramToothState.Remove(stale);
            }
        }

        private async Task ProjectStatusChartAsync(Patient patient, List<Tooth> teeth, IReadOnlyList<ParsedOdontogramToothState> parsedStates, DateTime now)
        {
            foreach (var parsed in parsedStates)
            {
                if (string.IsNullOrWhiteSpace(parsed.ProjectedStatusCode))
                {
                    continue;
                }

                var status = await GetOrCreateToothStatusAsync(parsed.ProjectedStatusCode!, now);
                var tooth = teeth.FirstOrDefault(t => t.tooth_number == parsed.BackendToothNumber);
                if (tooth == null)
                {
                    tooth = new Tooth
                    {
                        id = Guid.NewGuid(),
                        patient_id = patient.id,
                        tooth_number = parsed.BackendToothNumber,
                        tooth_name = $"Tooth {parsed.BackendToothNumber}",
                        tooth_status_id = status.id,
                        patient = patient,
                        tooth_status = status,
                        created_at = now,
                        updated_at = now
                    };
                    teeth.Add(tooth);
                    await _context.Tooth.AddAsync(tooth);
                    continue;
                }

                var currentCode = tooth.tooth_status?.code;
                var validation = ToothStatusValidator.Validate(currentCode, status.code);
                if (!validation.IsValid)
                {
                    throw new OdontogramValidationException(validation.Reason ?? $"Transition from {currentCode} to {status.code} is incompatible.");
                }

                if (tooth.tooth_status_id != status.id)
                {
                    tooth.tooth_status_id = status.id;
                    tooth.tooth_status = status;
                    tooth.updated_at = now;
                }
            }
        }

        private async Task<ToothStatus> GetOrCreateToothStatusAsync(string code, DateTime now)
        {
            var normalized = code.Trim().ToUpperInvariant();
            var status = await _context.ToothStatus.FirstOrDefaultAsync(s => s.code == normalized);
            if (status != null)
            {
                return status;
            }

            status = new ToothStatus
            {
                id = Guid.NewGuid(),
                code = normalized,
                description = normalized.Replace("_", " "),
                color = "#94a3b8",
                created_at = now,
                updated_at = now
            };
            await _context.ToothStatus.AddAsync(status);
            return status;
        }

        private async Task ReplaceDraftPlanItemsAsync(
            Guid patientId,
            List<AdvancedOdontogramPlanChangeDTO> changes,
            JsonElement planChart,
            IReadOnlyList<ParsedOdontogramToothState> parsedPlan,
            DateTime now,
            string? userKey)
        {
            var existingDrafts = await _context.OdontogramPlanItem
                .Where(p => p.patient_id == patientId && p.status == "Draft")
                .ToListAsync();
            _context.OdontogramPlanItem.RemoveRange(existingDrafts);

            if (changes.Count == 0)
            {
                return;
            }

            var services = await _context.Service.AsNoTracking().ToListAsync();
            var planTeeth = planChart.TryGetProperty("teeth", out var teethElement) && teethElement.ValueKind == JsonValueKind.Object
                ? teethElement
                : default;

            foreach (var change in changes.Where(c => c.advanced_tooth_number > 0 && !string.IsNullOrWhiteSpace(c.axis)))
            {
                var parsed = parsedPlan.FirstOrDefault(p => p.AdvancedToothNumber == change.advanced_tooth_number);
                var state = parsed?.State ?? TryGetToothState(planTeeth, change.advanced_tooth_number);
                var surfaces = _mapper.InferProposedSurfaces(state);
                var service = InferService(change, state, services);
                var fromJson = JsonSerializer.Serialize(new { label = change.from });
                var toJson = JsonSerializer.Serialize(new
                {
                    label = change.to,
                    state = JsonSerializer.Deserialize<JsonElement>(state.GetRawText())
                });

                await _context.OdontogramPlanItem.AddAsync(new OdontogramPlanItem
                {
                    id = Guid.NewGuid(),
                    patient_id = patientId,
                    backend_tooth_number = parsed?.BackendToothNumber,
                    advanced_tooth_number = change.advanced_tooth_number,
                    axis = change.axis.Trim(),
                    from_json = fromJson,
                    to_json = toJson,
                    proposed_service_id = service?.id,
                    proposed_surfaces = surfaces,
                    status = "Draft",
                    created_at = now,
                    updated_at = now,
                    created_by = userKey,
                    updated_by = userKey
                });
            }
        }

        private static JsonElement TryGetToothState(JsonElement teethElement, int advancedToothNumber)
        {
            if (teethElement.ValueKind == JsonValueKind.Object &&
                teethElement.TryGetProperty(advancedToothNumber.ToString(), out var state) &&
                state.ValueKind == JsonValueKind.Object)
            {
                return state.Clone();
            }

            using var doc = JsonDocument.Parse("""{"toothSelection":"tooth-base"}""");
            return doc.RootElement.Clone();
        }

        private static Service? InferService(AdvancedOdontogramPlanChangeDTO change, JsonElement state, IReadOnlyList<Service> services)
        {
            var text = $"{change.axis} {change.to} {state.GetRawText()}".ToLowerInvariant();
            string[] needles;
            if (text.Contains("bridge") || text.Contains("pontic")) needles = new[] { "bridge" };
            else if (text.Contains("veneer")) needles = new[] { "veneer" };
            else if (text.Contains("crown")) needles = new[] { "crown" };
            else if (text.Contains("implant")) needles = new[] { "implant" };
            else if (text.Contains("extract") || text.Contains("missing")) needles = new[] { "extract" };
            else if (text.Contains("endo") || text.Contains("root canal")) needles = new[] { "root", "endo" };
            else if (text.Contains("filling") || text.Contains("filled") || text.Contains("caries") || text.Contains("cavity")) needles = new[] { "filling", "restor" };
            else return null;

            return services.FirstOrDefault(service =>
            {
                var haystack = $"{service.name} {service.visual_cue_code}".ToLowerInvariant();
                return needles.Any(haystack.Contains);
            });
        }

        private static bool IsBridgeLike(OdontogramPlanItem item)
        {
            var text = $"{item.axis} {item.to_json}".ToLowerInvariant();
            return text.Contains("bridge") || text.Contains("pontic") || text.Contains("splint");
        }

        private static List<string> SplitSurfaces(string? surfaces)
        {
            return (surfaces ?? string.Empty)
                .ToUpperInvariant()
                .Where(ch => "MODBLCIF".Contains(ch))
                .Select(ch => ch.ToString())
                .Distinct()
                .ToList();
        }

        private async Task AddAuditAsync(Guid patientId, string eventType, object payload, string? userKey)
        {
            await _context.OdontogramAuditEvent.AddAsync(new OdontogramAuditEvent
            {
                id = Guid.NewGuid(),
                patient_id = patientId,
                event_type = eventType,
                payload = JsonSerializer.Serialize(payload),
                created_at = DateTime.UtcNow,
                created_by = userKey
            });
        }

        private static void ValidateChart(JsonElement chart, string name)
        {
            if (chart.ValueKind == JsonValueKind.Undefined || chart.ValueKind == JsonValueKind.Null)
            {
                throw new OdontogramValidationException($"{name} is required.");
            }

            if (chart.ValueKind != JsonValueKind.Object)
            {
                throw new OdontogramValidationException($"{name} must be a JSON object.");
            }

            if (!chart.TryGetProperty("teeth", out var teeth) || teeth.ValueKind != JsonValueKind.Object)
            {
                throw new OdontogramValidationException($"{name}.teeth must be a JSON object.");
            }

            if (Encoding.UTF8.GetByteCount(chart.GetRawText()) > MaxChartPayloadBytes)
            {
                throw new OdontogramValidationException($"{name} exceeds the maximum supported payload size.");
            }
        }

        private async Task<string> BuildCurrentRowVersionAsync(Guid patientId)
        {
            var snapshot = await _context.PatientOdontogramSnapshot.AsNoTracking().FirstOrDefaultAsync(s => s.patient_id == patientId);
            var stateUpdatedAt = await _context.OdontogramToothState
                .AsNoTracking()
                .Where(s => s.patient_id == patientId)
                .Select(s => (DateTime?)s.updated_at)
                .MaxAsync();
            var planUpdatedAt = await _context.OdontogramPlanItem
                .AsNoTracking()
                .Where(p => p.patient_id == patientId)
                .Select(p => (DateTime?)p.updated_at)
                .MaxAsync();
            var input = $"{patientId}:{snapshot?.updated_at.Ticks ?? 0}:{snapshot?.payload?.Length ?? 0}:{stateUpdatedAt?.Ticks ?? 0}:{planUpdatedAt?.Ticks ?? 0}";
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static string BuildCompatibilityRowVersion(Guid patientId, IReadOnlyList<Tooth> teeth)
        {
            var input = new StringBuilder(patientId.ToString());
            foreach (var tooth in teeth.OrderBy(t => t.tooth_number))
            {
                input.Append(':')
                    .Append(tooth.tooth_number)
                    .Append(':')
                    .Append(tooth.tooth_status_id)
                    .Append(':')
                    .Append(tooth.updated_at.Ticks);
            }

            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input.ToString()));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static bool IsMissingOdontogramPersistenceTable(Exception ex)
        {
            if (ex is PostgresException pg && pg.SqlState == "42P01")
            {
                var message = pg.MessageText.ToLowerInvariant();
                return message.Contains("patient_odontogram_snapshot")
                    || message.Contains("odontogram_tooth_state")
                    || message.Contains("odontogram_plan_item")
                    || message.Contains("odontogram_audit_event");
            }

            return ex.InnerException != null && IsMissingOdontogramPersistenceTable(ex.InnerException);
        }

        private static string? NormalizeIfMatch(string? ifMatch)
        {
            return string.IsNullOrWhiteSpace(ifMatch) ? null : ifMatch.Trim().Trim('"');
        }

        private static string NormalizeDefaultStatus(string? status)
        {
            var compact = (status ?? "Planned").Replace(" ", "", StringComparison.OrdinalIgnoreCase).Trim().ToLowerInvariant();
            return compact == "inprogress" ? "InProgress" : "Planned";
        }

        private static OdontogramPlanItemDTO ToDto(OdontogramPlanItem item)
        {
            return new OdontogramPlanItemDTO
            {
                id = item.id,
                patient_id = item.patient_id,
                appointment_id = item.appointment_id,
                treatment_id = item.treatment_id,
                backend_tooth_number = item.backend_tooth_number,
                advanced_tooth_number = item.advanced_tooth_number,
                axis = item.axis,
                from_json = string.IsNullOrWhiteSpace(item.from_json) ? null : JsonDocument.Parse(item.from_json).RootElement.Clone(),
                to_json = JsonDocument.Parse(item.to_json).RootElement.Clone(),
                proposed_service_id = item.proposed_service_id,
                proposed_service_name = item.proposed_service?.name,
                proposed_surfaces = item.proposed_surfaces,
                status = item.status,
                created_at = item.created_at,
                updated_at = item.updated_at
            };
        }
    }
}
