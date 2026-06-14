using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class PerioMeasurement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid perio_status_id { get; set; }

        [Required]
        public int tooth_number { get; set; }

        // Site indices: 0: DB, 1: B, 2: MB, 3: ML, 4: L, 5: DL
        [Required]
        [Range(0, 5)]
        public int site_index { get; set; }

        public int pocket_depth { get; set; } // PD
        public int clinical_attachment_level { get; set; } // CAL
        public int gingival_margin { get; set; } // GM
        public int recession { get; set; } // Recession (>=0). Derived from GM when positive
        public bool bleeding_on_probing { get; set; } // BOP

        public int mobility { get; set; } // Grade I, II, III (0-3)
        public int furcation { get; set; } // 0-3

        [ForeignKey("perio_status_id")]
        public virtual required PerioStatus perio_status { get; set; }
    }
}
