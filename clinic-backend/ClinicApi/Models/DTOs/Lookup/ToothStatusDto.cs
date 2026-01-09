using System;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class ToothStatusDto
    {
        public Guid id { get; set; }
        public string code { get; set; }
        public string? description { get; set; }
    }
}
