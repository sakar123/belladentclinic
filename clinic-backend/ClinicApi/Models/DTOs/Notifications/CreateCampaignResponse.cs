using System;

namespace ClinicApi.Models.DTOs.Notifications
{
    public class CreateCampaignResponse
    {
        public Guid campaign_id { get; set; }
        public string status { get; set; } = "Draft";
    }
}
