using System;

namespace ClinicApi.Models.Entities
{
    public abstract class BaseAuditableEntity : BaseEntity
    {
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
        public string? created_by { get; set; }
        public string? updated_by { get; set; }
    }
}
