using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AvailabilityDto
    {
        public int Id { get; set; }
        
        [Required]
        public string PersonnelId { get; set; } = string.Empty;
        
        public string? PersonnelName { get; set; }
        
        [Required]
        public DateTime Date { get; set; } = DateTime.Today;
        
        [Required]
        public TimeSpan StartTime { get; set; }
        
        [Required]
        public TimeSpan EndTime { get; set; }
        
        public string? Notes { get; set; }
        
        public bool IsBooked { get; set; }
    }
}
