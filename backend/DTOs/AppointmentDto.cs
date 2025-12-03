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
        
        [Required]
        public string TaskDescription { get; set; } = string.Empty;
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        [RegularExpression(@"^(Booked|Completed|Cancelled)$", ErrorMessage = "Invalid status value.")]
        public string Status { get; set; } = "Booked";
    }
}
