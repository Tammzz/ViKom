using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        
        [Required]
        public string PatientId { get; set; } = string.Empty;
        
        public string? PatientName { get; set; }
        
        [Required]
        public int AvailabilityId { get; set; }
        
        public string? PersonnelId { get; set; }
        
        public string? PersonnelName { get; set; }
        
        public string? Date { get; set; }
        
        // Stores comma-separated list of tasks (e.g., "Medication, Vitals, Exercises")
        [Required(ErrorMessage = "At least one task is required.")]
        public string Tasks { get; set; } = string.Empty;
        
        // Auto-filled from availability slot - not user input
        public string? StartTime { get; set; }
        
        // Auto-filled from availability slot - not user input
        public string? EndTime { get; set; }
        
        // System-controlled - computed dynamically
        [RegularExpression(@"^(Booked|Completed|Cancelled)$", ErrorMessage = "Invalid status value.")]
        public string Status { get; set; } = "Booked";
    }
}
