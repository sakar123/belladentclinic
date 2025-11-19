using System;
using ClinicApi.Models.Enumerations;

namespace ClinicApi.Models.DTOs
{
    public class PersonDTO
    {
        public Guid id { get; set; }
        
        public string first_name { get; set; } = null!;
        
        public string last_name { get; set; } = null!;
        
        public DateTime? date_of_birth { get; set; }
        
        public GenderEnum gender { get; set; }  // you can use enum if you have GenderEnum
        
        public string? email { get; set; }
        
        public string? phone_number { get; set; }
        
        public string? address { get; set; }
        
        public string? a_identifier { get; set; }  // maps to a_identifier
        
        public DateTime created_at { get; set; }
        
        public DateTime updated_at { get; set; }
        
        public string? created_by { get; set; }
        
        public string? updated_by { get; set; }
    }
}
