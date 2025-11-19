using System;
using System.ComponentModel.DataAnnotations;
using ClinicApi.Models.Enumerations;

namespace ClinicApi.Models.DTOs
{
    public class BillingDTO
    {
        public Guid? id { get; set; }
        
        [Required]
        public Guid patient_id { get; set; }
        
        [Required]
        public DateTime issue_date { get; set; }
        
        [Required]
        public DateTime due_date { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal total_amount { get; set; }
        
        [Required]
        [Range(0, 999999.99)]
        public decimal amount_paid { get; set; }
        
        [Required]
        public BillStatusEnum status { get; set; }
    }
}
