namespace backend.DTOs
{
    public class PatientDetailsDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? SupabaseProfileId { get; set; }
        public int TotalAppointments { get; set; }
        public string LastAppointmentDate { get; set; } = string.Empty;
        public List<AppointmentSummaryDto> UpcomingAppointments { get; set; } = new();
    }
}