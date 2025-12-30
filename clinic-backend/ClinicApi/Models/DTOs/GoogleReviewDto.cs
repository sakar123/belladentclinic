namespace ClinicApi.Models.DTOs
{
    public class GoogleReviewDto
    {
        public string AuthorName { get; set; }
        public string Text { get; set; }
        public int Rating { get; set; }
        public string RelativeTimeDescription { get; set; }
    }
}
