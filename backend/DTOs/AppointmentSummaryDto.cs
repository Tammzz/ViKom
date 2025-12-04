namespace backend.DTOs
{
    public class AppointmentSummaryDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PersonnelName { get; set; } = string.Empty;
        // Stores comma-separated list of tasks (e.g., "Medication, Vitals, Exercises")
        public string Tasks { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string StartTime { get; set; } = string.Empty; // "14:30" format
        public string EndTime { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string FormattedDateTime { get; set; } = string.Empty;
    }
}
