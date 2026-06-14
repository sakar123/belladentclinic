using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.DTOs
{
    public class PerioMeasurementDTO
    {
        public Guid? id { get; set; }
        [Required]
        public int tooth_number { get; set; }
        [Range(0,5)]
        public int site_index { get; set; } // 0: DB, 1: B, 2: MB, 3: ML, 4: L, 5: DL
        public int pocket_depth { get; set; }
        public int clinical_attachment_level { get; set; }
        public int gingival_margin { get; set; }
        public int recession { get; set; }
        public bool bleeding_on_probing { get; set; }
        public int mobility { get; set; } // 0-3
        public int furcation { get; set; } // 0-3
    }

    public class PerioStatusDTO
    {
        public Guid? id { get; set; }
        [Required]
        public Guid patient_id { get; set; }
        [Required]
        public Guid staff_id { get; set; }
        public DateTime? examination_date { get; set; }
        public bool smoker { get; set; }
        public int bone_loss { get; set; }
        public List<PerioMeasurementDTO> measurements { get; set; } = new();
    }

    public class CreatePerioRequest
    {
        [Required]
        public Guid patient_id { get; set; }
        [Required]
        public Guid staff_id { get; set; }
        public DateTime? examination_date { get; set; }
        public bool smoker { get; set; }
        public int bone_loss { get; set; }
        [Required]
        public List<PerioMeasurementDTO> measurements { get; set; } = new();
    }
}
