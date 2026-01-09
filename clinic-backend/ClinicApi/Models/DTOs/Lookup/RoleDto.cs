using System;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class RoleDto
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string? description { get; set; }
    }
}
