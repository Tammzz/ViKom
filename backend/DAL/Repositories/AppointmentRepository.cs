using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.DAL.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AppointmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetAllAsync()
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Availability)
                .ThenInclude(av => av.Personnel)
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Availability)
                .ThenInclude(av => av.Personnel)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(string patientId)
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Availability)
                .ThenInclude(av => av.Personnel)
                .Where(a => a.PatientId == patientId)
                .ToListAsync();
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await SaveChangesAsync();
            return appointment;
        }

        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            _context.Appointments.Update(appointment);
            await SaveChangesAsync();
            return appointment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;
            
            _context.Appointments.Remove(appointment);
            return await SaveChangesAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
