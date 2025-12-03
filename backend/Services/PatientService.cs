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

        public async Task<PatientDetailsDto?> GetPatientDetailsAsync(string patientId)
        {
            var patient = await _userRepository.GetByIdAsync(patientId);
            if (patient == null)
                return null;

            var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);

            return new PatientDetailsDto
            {
                Id = patient.Id,
                FullName = patient.FullName,
                Email = patient.Email ?? string.Empty,
                PhoneNumber = patient.PhoneNumber ?? string.Empty,
                Appointments = appointments.Select(a => new AppointmentSummaryDto
                {
                    Id = a.Id,
                    PatientName = patient.FullName,
                    PersonnelName = a.Availability?.Personnel?.FullName ?? string.Empty,
                    TaskDescription = a.TaskDescription,
                    Date = a.Availability?.Date ?? DateTime.MinValue,
                    StartTime = a.StartTime.ToString(@"hh\:mm"),
                    EndTime = a.EndTime.ToString(@"hh\:mm"),
                    Status = a.Status,
                    FormattedDateTime = $"{a.Availability?.Date:yyyy-MM-dd} {a.StartTime:hh\\:mm}-{a.EndTime:hh\\:mm}"
                }).ToList()
            };
        }
    }
}
