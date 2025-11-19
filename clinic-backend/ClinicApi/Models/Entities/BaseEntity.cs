using System;

namespace ClinicApi.Models.Entities
{
    public abstract class BaseEntity
    {
        public Guid id { get; set; }
    }
}
