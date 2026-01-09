using System;

namespace ClinicApi.Models.DTOs.Lookup
{
    public class DiscountTypeDto
    {
        public Guid id { get; set; }
        public string discount_name { get; set; }
        public decimal discount_percentage { get; set; }
    }
}
