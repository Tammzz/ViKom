using backend.DTOs;
using backend.DAL.Repositories;
using backend.Models;

namespace backend.Services
{
    public class PatientService : IPatientService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientUserLinkRepository _linkRepository;

        public PatientService(
            IUserRepository userRepository,
            IAppointmentRepository appointmentRepository,
            IPatientUserLinkRepository linkRepository)
        {
            _userRepository = userRepository;
            _appointmentRepository = appointmentRepository;
            _linkRepository = linkRepository;
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
                    Address = patient.Address ?? string.Empty,
                    SupabaseProfileId = patient.SupabaseProfileId,
                    TotalAppointments = appointments.Count(),
                    LastAppointmentDate = lastAppointment?.Availability.Date.ToString("dd/MM/yyyy") ?? "Never"
                });
            }

            return patientList;
        }

        public async Task<IEnumerable<PatientListDto>> GetLinkedPatientsAsync(string personnelId)
        {
            var links = await _linkRepository.GetBySecondaryUserIdAsync(personnelId);
            var patientIds = links.Select(l => l.PatientId).Distinct().ToList();

            var patients = await _userRepository.GetPatientsAsync();
            var filteredPatients = patients.Where(p => patientIds.Contains(p.Id)).ToList();

            // If there are no link records yet, fall back to appointment-based patients.
            if (!filteredPatients.Any())
            {
                filteredPatients = (await _userRepository.GetPatientsByPersonnelAsync(personnelId)).ToList();
            }

            var patientList = new List<PatientListDto>();

            foreach (var patient in filteredPatients)
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
                    Address = patient.Address ?? string.Empty,
                    SupabaseProfileId = patient.SupabaseProfileId,
                    TotalAppointments = appointments.Count(),
                    LastAppointmentDate = lastAppointment?.Availability.Date.ToString("dd/MM/yyyy") ?? "Never"
                });
            }

            return patientList;
        }

        public async Task<PatientDetailsDto?> GetPatientByIdAsync(string patientId)
        {
            var patient = await _userRepository.GetByIdAsync(patientId);
            if (patient == null || !string.Equals(patient.Role, "Patient", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var appointments = (await _appointmentRepository.GetByPatientIdAsync(patientId)).ToList();
            var upcomingAppointments = (await _appointmentRepository.GetUpcomingByPatientIdAsync(patientId, 10)).ToList();
            var lastAppointment = appointments
                .OrderByDescending(a => a.Availability.Date)
                .FirstOrDefault();

            return new PatientDetailsDto
            {
                Id = patient.Id,
                FullName = patient.FullName,
                Email = patient.Email ?? string.Empty,
                PhoneNumber = patient.PhoneNumber ?? string.Empty,
                Address = patient.Address ?? string.Empty,
                SupabaseProfileId = patient.SupabaseProfileId,
                TotalAppointments = appointments.Count,
                LastAppointmentDate = lastAppointment?.Availability.Date.ToString("dd/MM/yyyy") ?? "Never",
                UpcomingAppointments = upcomingAppointments.Select(MapToAppointmentSummary).ToList()
            };
        }

        private static AppointmentSummaryDto MapToAppointmentSummary(Appointment appointment)
        {
            return new AppointmentSummaryDto
            {
                Id = appointment.Id,
                PatientName = appointment.Patient?.FullName ?? string.Empty,
                PersonnelName = appointment.Availability?.Personnel?.FullName ?? string.Empty,
                Tasks = appointment.Tasks,
                Date = appointment.Availability?.Date ?? DateTime.MinValue,
                StartTime = appointment.StartTime.ToString(@"hh\:mm"),
                EndTime = appointment.EndTime.ToString(@"hh\:mm"),
                Status = appointment.Status,
                FormattedDateTime = $"{appointment.Availability?.Date:yyyy-MM-dd} {appointment.StartTime:hh\\:mm}-{appointment.EndTime:hh\\:mm}",
                AvailabilityNotes = appointment.Availability?.Notes ?? string.Empty
            };
        }
    }
}
