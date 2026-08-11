using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ClinicApi.Models.DTOs
{
    public class AdvancedOdontogramStateDTO
    {
        public Guid patient_id { get; set; }
        public string source_version { get; set; } = "react-advanced-odontogram@2.2.0";
        public int schema_version { get; set; } = 1;
        public string row_version { get; set; } = string.Empty;
        public JsonElement status_chart { get; set; }
        public JsonElement plan_chart { get; set; }
        public List<ToothDTO> teeth { get; set; } = new();
        public List<TreatmentDTO> treatments { get; set; } = new();
        public PerioStatusDTO? latest_perio { get; set; }
        public List<OdontogramPlanItemDTO> plan_items { get; set; } = new();
        public string? compatibility_mode { get; set; }
        public string? compatibility_reason { get; set; }
    }

    public class SaveAdvancedOdontogramStateRequest
    {
        [StringLength(50)]
        public string? source_version { get; set; }

        [Required]
        public JsonElement status_chart { get; set; }

        [Required]
        public JsonElement plan_chart { get; set; }

        public List<AdvancedOdontogramPlanChangeDTO> plan_changes { get; set; } = new();
        public DateTime? client_saved_at { get; set; }
    }

    public class AdvancedOdontogramPlanChangeDTO
    {
        public int tooth_no { get; set; }

        [JsonPropertyName("toothNo")]
        public int toothNo { get; set; }

        [Required]
        [StringLength(80)]
        public string axis { get; set; } = string.Empty;

        public string? from { get; set; }
        public string? to { get; set; }

        [JsonIgnore]
        public int advanced_tooth_number => tooth_no != 0 ? tooth_no : toothNo;
    }

    public class OdontogramPlanItemDTO
    {
        public Guid id { get; set; }
        public Guid patient_id { get; set; }
        public Guid? appointment_id { get; set; }
        public Guid? treatment_id { get; set; }
        public int? backend_tooth_number { get; set; }
        public int? advanced_tooth_number { get; set; }
        public string axis { get; set; } = string.Empty;
        public JsonElement? from_json { get; set; }
        public JsonElement to_json { get; set; }
        public Guid? proposed_service_id { get; set; }
        public string? proposed_service_name { get; set; }
        public string? proposed_surfaces { get; set; }
        public string status { get; set; } = "Draft";
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }

    public class CommitOdontogramPlanRequest
    {
        [Required]
        public Guid appointment_id { get; set; }

        [Required]
        public Guid staff_id { get; set; }

        [Required]
        public List<Guid> plan_item_ids { get; set; } = new();

        public string? default_status { get; set; } = "Planned";
    }
}
