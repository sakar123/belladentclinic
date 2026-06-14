using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class PersonContactMethod
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }

        [Required]
        public Guid person_id { get; set; }

        [Required]
        [StringLength(10)]
        public required string channel { get; set; } // Email, SMS

        [Required]
        [StringLength(255)]
        public required string contact_value { get; set; }

        public bool is_primary { get; set; } = false;
        public bool is_verified { get; set; } = false;
        public bool is_active { get; set; } = true;
        public DateTime? verified_at { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [ForeignKey("person_id")]
        public virtual Person? person { get; set; }
    }
}
