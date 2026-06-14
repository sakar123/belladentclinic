using System;

namespace ClinicApi.Models.DTOs
{
    public class InvitationDto
    {
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public Guid role_id { get; set; }
        public Guid? specialty_id { get; set; }
        public string? license_number { get; set; }
    }

    public class CompleteProfileDto
    {
        public string staff_id { get; set; } = string.Empty;
    }
}
