using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace ClinicApi.Models.DTOs
{
    public class OdontogramSnapshotDTO
    {
        public Guid? id { get; set; }
        public Guid patient_id { get; set; }
        public string source_version { get; set; } = "react-advanced-odontogram";
        public JsonElement payload { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }
    }

    public class SaveOdontogramSnapshotRequest
    {
        [Required]
        public JsonElement payload { get; set; }

        [StringLength(50)]
        public string? source_version { get; set; }
    }
}
