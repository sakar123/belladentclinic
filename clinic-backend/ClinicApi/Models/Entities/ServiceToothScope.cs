using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    // Join entity for service_tooth_scope (service_id + tooth_scope TEXT)
    public class ServiceToothScope
    {
        [Required]
        public Guid service_id { get; set; }

        [Required]
        [StringLength(25)]
        public string tooth_scope { get; set; } = string.Empty; // NonTooth | SingleTooth | MultipleTeeth | FullMouth

        [ForeignKey("service_id")]
        public virtual required Service service { get; set; }
    }
}

