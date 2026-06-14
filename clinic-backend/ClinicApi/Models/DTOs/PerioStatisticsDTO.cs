namespace ClinicApi.Models.DTOs
{
    public class PerioStatisticsDTO
    {
        public double bop_percentage { get; set; }
        public double mean_pd { get; set; }
        public double mean_cal { get; set; }
        public int sites_over_4mm { get; set; }
        public int sites_over_6mm { get; set; }
    }
}

