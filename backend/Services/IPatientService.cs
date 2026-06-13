using backend.DTOs;

namespace backend.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientListDto>> GetAllPatientsAsync();
        Task<IEnumerable<PatientListDto>> GetLinkedPatientsAsync(string personnelId);
        Task<PatientDetailsDto?> GetPatientByIdAsync(string patientId);
    }
}
