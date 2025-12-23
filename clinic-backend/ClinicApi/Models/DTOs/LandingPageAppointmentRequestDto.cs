namespace ClinicApi.Models.DTOs
{
    public class LandingPageAppointmentRequestDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Date { get; set; }
        public string Time { get; set; }
        public string Gender { get; set; }
        public string Message { get; set; }
    }
}
