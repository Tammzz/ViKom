using backend.DTOs;

namespace backend.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientListDto>> GetAllPatientsAsync();
        Task<IEnumerable<PatientListDto>> GetLinkedPatientsAsync(string personnelId);
        Task<PatientDetailsDto?> GetPatientByIdAsync(string patientId);
        Task<bool> UpdatePatientNotesAsync(string patientId, string? notes);
        Task<PatientDetailsDto?> UpdatePatientAsync(string patientId, PatientUpdateDto dto);
    }
}
