using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Records a call placed from a personnel user to a patient's TV profile
    /// (the "Ring pasient" feature). Used to surface a communication history.
    /// </summary>
    public class CallLog
    {
        public int Id { get; set; }

        [Required]
        public string PatientId { get; set; } = string.Empty;

        [ForeignKey("PatientId")]
        public User Patient { get; set; } = null!;

        [Required]
        public string PersonnelId { get; set; } = string.Empty;

        [ForeignKey("PersonnelId")]
        public User Personnel { get; set; } = null!;

        public DateTime StartedAt { get; set; }

        // "Initiated", "Answered", "Declined", "Ended", "Missed"
        [RegularExpression(@"^(Initiated|Answered|Declined|Ended|Missed)$", ErrorMessage = "Invalid call status value.")]
        public string Status { get; set; } = "Initiated";
    }
}
