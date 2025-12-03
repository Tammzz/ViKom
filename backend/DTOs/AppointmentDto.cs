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
        
        [Required]
        public string TaskDescription { get; set; } = string.Empty;
        
        [Required]
        public string StartTime { get; set; } = string.Empty;
        
        [Required]
        public string EndTime { get; set; } = string.Empty;
        
        [RegularExpression(@"^(Booked|Completed|Cancelled)$", ErrorMessage = "Invalid status value.")]
        public string Status { get; set; } = "Booked";
    }
}
