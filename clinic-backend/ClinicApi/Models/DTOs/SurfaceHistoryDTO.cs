using System;
using System.Collections.Generic;

namespace ClinicApi.Models.DTOs
{
    public class SurfaceTreatmentEntryDto
    {
        public Guid id { get; set; }
        public string service_name { get; set; }
        public string status { get; set; }
        public DateTime? date { get; set; }
    }

    public class SurfaceHistoryDTO
    {
        public string surface { get; set; }
        public List<SurfaceTreatmentEntryDto> treatments { get; set; } = new();
        public string? currentStatus { get; set; }
    }
}

