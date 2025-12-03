using backend.DTOs;
using backend.DAL.Repositories;

namespace backend.Services
{
    public class PatientService : IPatientService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAppointmentRepository _appointmentRepository;

        public PatientService(
            IUserRepository userRepository,
            IAppointmentRepository appointmentRepository)
        {
            _userRepository = userRepository;
            _appointmentRepository = appointmentRepository;
        }

        public async Task<IEnumerable<PatientListDto>> GetAllPatientsAsync()
        {
            var patients = await _userRepository.GetPatientsAsync();
            var patientList = new List<PatientListDto>();

            foreach (var patient in patients)
            {
                var appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
                var lastAppointment = appointments
                    .OrderByDescending(a => a.Availability.Date)
                    .FirstOrDefault();

                patientList.Add(new PatientListDto
                {
                    Id = patient.Id,
                    FullName = patient.FullName,
                    Email = patient.Email ?? string.Empty,
                    PhoneNumber = patient.PhoneNumber ?? string.Empty,
                    TotalAppointments = appointments.Count(),
                    LastAppointmentDate = lastAppointment?.Availability.Date.ToString("yyyy-MM-dd") ?? "Never"
                });
            }

            return patientList;
        }
    }
}
