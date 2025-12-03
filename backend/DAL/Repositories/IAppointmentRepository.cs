using backend.Models;

namespace backend.DAL.Repositories
{
    public interface IAppointmentRepository
    {
        Task<IEnumerable<Appointment>> GetAllAsync();
        Task<Appointment?> GetByIdAsync(int id);
        Task<IEnumerable<Appointment>> GetByPatientIdAsync(string patientId);
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<Appointment> UpdateAsync(Appointment appointment);
        Task<bool> DeleteAsync(int id);
        Task<bool> SaveChangesAsync();
    }
}
