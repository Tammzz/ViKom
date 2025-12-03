namespace backend.DTOs
{
    public class PatientDetailsDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<AppointmentSummaryDto> Appointments { get; set; } = new();
    }
}
