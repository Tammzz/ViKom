using backend.DTOs;

namespace backend.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientListDto>> GetAllPatientsAsync();
        Task<PatientDetailsDto?> GetPatientDetailsAsync(string patientId);
    }
}
