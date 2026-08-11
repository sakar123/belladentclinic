using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using ClinicApi.Data;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ClinicApi.Services.Implementations
{
    public class OdontogramSnapshotService : IOdontogramSnapshotService
    {
        private readonly DentalClinicContext _context;

        public OdontogramSnapshotService(DentalClinicContext context)
        {
            _context = context;
        }

        public async Task<OdontogramSnapshotDTO?> GetLatestAsync(Guid patientId)
        {
            PatientOdontogramSnapshot? snapshot;
            try
            {
                snapshot = await _context.PatientOdontogramSnapshot
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.patient_id == patientId);
            }
            catch (Exception ex) when (IsMissingSnapshotTable(ex))
            {
                return null;
            }

            return snapshot == null ? null : ToDto(snapshot);
        }

        public async Task<OdontogramSnapshotDTO> UpsertAsync(Guid patientId, SaveOdontogramSnapshotRequest request)
        {
            if (request.payload.ValueKind == JsonValueKind.Undefined || request.payload.ValueKind == JsonValueKind.Null)
            {
                throw new InvalidOperationException("Odontogram payload is required.");
            }

            if (request.payload.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidOperationException("Odontogram payload must be a JSON object.");
            }

            try
            {
                if (!await _context.Patient.AnyAsync(p => p.id == patientId))
                {
                    throw new KeyNotFoundException("Patient not found");
                }

                var payloadJson = request.payload.GetRawText();
                var sourceVersion = string.IsNullOrWhiteSpace(request.source_version)
                    ? "react-advanced-odontogram"
                    : request.source_version!.Trim();

                var snapshot = await _context.PatientOdontogramSnapshot
                    .FirstOrDefaultAsync(s => s.patient_id == patientId);
                var now = DateTime.UtcNow;

                if (snapshot == null)
                {
                    snapshot = new PatientOdontogramSnapshot
                    {
                        id = Guid.NewGuid(),
                        patient_id = patientId,
                        payload = payloadJson,
                        source_version = sourceVersion,
                        created_at = now,
                        updated_at = now
                    };
                    await _context.PatientOdontogramSnapshot.AddAsync(snapshot);
                }
                else
                {
                    snapshot.payload = payloadJson;
                    snapshot.source_version = sourceVersion;
                    snapshot.updated_at = now;
                }

                await _context.SaveChangesAsync();
                return ToDto(snapshot);
            }
            catch (Exception ex) when (IsMissingSnapshotTable(ex))
            {
                throw new InvalidOperationException("Odontogram snapshot table is not available. Apply the latest database migration before saving odontogram snapshots.", ex);
            }
        }

        private static OdontogramSnapshotDTO ToDto(PatientOdontogramSnapshot snapshot)
        {
            using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(snapshot.payload) ? "{}" : snapshot.payload);
            return new OdontogramSnapshotDTO
            {
                id = snapshot.id,
                patient_id = snapshot.patient_id,
                source_version = snapshot.source_version,
                payload = doc.RootElement.Clone(),
                created_at = snapshot.created_at,
                updated_at = snapshot.updated_at
            };
        }

        private static bool IsMissingSnapshotTable(Exception ex)
        {
            if (ex is PostgresException pg && pg.SqlState == "42P01")
            {
                return pg.MessageText.ToLowerInvariant().Contains("patient_odontogram_snapshot");
            }

            return ex.InnerException != null && IsMissingSnapshotTable(ex.InnerException);
        }
    }
}
