namespace backend.DTOs
{
    public class CallLogDto
    {
        public int Id { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string PersonnelId { get; set; } = string.Empty;
        public string PersonnelName { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
