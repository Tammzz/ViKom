using backend.DTOs;

namespace backend.Services
{
    public interface IVisitService
    {
        /// <summary>
        /// Returns the existing visit for the appointment, or creates a new
        /// Active one (seeding tasks and moving the appointment to InProgress).
        /// Idempotent so "Start besøk" and "Fortsett besøk" share one call.
        /// </summary>
        Task<VisitDto?> StartOrGetForAppointmentAsync(int appointmentId, string nurseId, string visitType);
        Task<VisitDto?> GetByIdAsync(int id);
        Task<VisitDto?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<VisitSummaryDto>> GetByPatientIdAsync(string patientId);
        Task<VisitDto?> UpdateNotesAsync(int visitId, string? notes);
        Task<VisitTaskDto?> AddTaskAsync(int visitId, string title);
        Task<VisitTaskDto?> UpdateTaskAsync(int visitId, int taskId, string status, string? skippedReason);
        Task<VisitDto?> CompleteAsync(int visitId, string? notes, bool followUpRequired);
        Task<VisitDto?> CancelAsync(int visitId, string reason, string? notes);
        Task<CallLogDto?> LogCallAttemptAsync(int visitId, LogCallAttemptRequest request);
    }
}
