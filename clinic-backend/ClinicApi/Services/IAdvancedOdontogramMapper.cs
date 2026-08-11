using System;
using System.Collections.Generic;
using System.Text.Json;
using ClinicApi.Models.DTOs;
using ClinicApi.Models.Entities;

namespace ClinicApi.Services
{
    public record AdvancedOdontogramCharts(JsonElement StatusChart, JsonElement PlanChart);

    public record ParsedOdontogramToothState(
        Guid PatientId,
        Guid? ToothId,
        int BackendToothNumber,
        int AdvancedToothNumber,
        string ChartKind,
        JsonElement State,
        string StateJson,
        string StateHash,
        string? Note,
        string? ProjectedStatusCode);

    public interface IAdvancedOdontogramMapper
    {
        AdvancedOdontogramCharts BuildCharts(Patient patient, IReadOnlyList<Tooth> teeth, PatientOdontogramSnapshot? snapshot);
        IReadOnlyList<ParsedOdontogramToothState> ParseChart(Guid patientId, string chartKind, JsonElement chart, IReadOnlyList<Tooth> teeth, Patient patient);
        int? AdvancedToBackendToothNumber(int advancedToothNumber, JsonElement state, IReadOnlyList<Tooth> teeth, Patient patient);
        string? InferProposedSurfaces(JsonElement state);
    }
}
