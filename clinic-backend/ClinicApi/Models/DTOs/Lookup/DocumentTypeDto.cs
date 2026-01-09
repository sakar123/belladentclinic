using System;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class DocumentTypeDto
    {
        public Guid id { get; set; }
        public string document_type_code { get; set; }
        public string name { get; set; }
        public string? description { get; set; }
    }
}
