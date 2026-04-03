using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicApi.Models.Entities
{
    public class Person
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid id { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string first_name { get; set; }
        
        [Required]
        [StringLength(50)]
        public required string last_name { get; set; }
        
        public DateTime? date_of_birth { get; set; }
        
        public string? gender { get; set; }
        
        [StringLength(100)]
        [EmailAddress]
        public string? email { get; set; }
        
        [StringLength(20)]
        public string? phone_number { get; set; }
        
        [StringLength(500)]
        public string? address { get; set; }
        
        public string? a_identifier { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }

        [InverseProperty("person")]
        public virtual ICollection<PersonContactMethod> contact_methods { get; set; }

        [InverseProperty("person")]
        public virtual ICollection<PersonNotificationPreference> notification_preferences { get; set; }

        [InverseProperty("person")]
        public virtual ICollection<PersonChannelSuppression> channel_suppressions { get; set; }

        public Person()
        {
            contact_methods = new HashSet<PersonContactMethod>();
            notification_preferences = new HashSet<PersonNotificationPreference>();
            channel_suppressions = new HashSet<PersonChannelSuppression>();
        }
    }
}
