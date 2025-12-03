using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public string PatientId { get; set; } = string.Empty;

        [ForeignKey("PatientId")]
        public User Patient { get; set; } = null!;

        [Required]
        public int AvailabilityId { get; set; }

        [ForeignKey("AvailabilityId")]
        public Availability Availability { get; set; } = null!;

        [Required(ErrorMessage = "Task description is required.")]
        public string TaskDescription { get; set; } = string.Empty;

        [DataType(DataType.Time)]
        public TimeSpan StartTime { get; set; }

        [DataType(DataType.Time)]
        public TimeSpan EndTime { get; set; }

        [RegularExpression(@"^(Booked|Completed|Cancelled)$", ErrorMessage = "Invalid status value.")]
        public string Status { get; set; } = "Booked";
    }
}
