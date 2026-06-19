using backend.DTOs;
using backend.DAL.Repositories;
using backend.Models;
using Microsoft.AspNetCore.Identity;

namespace backend.Services
{
    public class PatientService : IPatientService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientUserLinkRepository _linkRepository;
        private readonly ICallLogService _callLogService;
        private readonly UserManager<User> _userManager;

        public PatientService(
            IUserRepository userRepository,
            IAppointmentRepository appointmentRepository,
            IPatientUserLinkRepository linkRepository,
            ICallLogService callLogService,
            UserManager<User> userManager)
        {
            _userRepository = userRepository;
            _appointmentRepository = appointmentRepository;
            _linkRepository = linkRepository;
            _callLogService = callLogService;
            _userManager = userManager;
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
            var patient = await _userRepository.GetByIdWithMedicationsAsync(patientId);
            if (patient == null || !string.Equals(patient.Role, "Patient", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var appointments = (await _appointmentRepository.GetByPatientIdAsync(patientId)).ToList();
            var upcomingAppointments = (await _appointmentRepository.GetUpcomingByPatientIdAsync(patientId, 10)).ToList();
            var pastAppointments = (await _appointmentRepository.GetHistoryByPatientIdAsync(patientId)).ToList();
            var recentCalls = (await _callLogService.GetRecentByPatientAsync(patientId, 5)).ToList();
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
                Notes = patient.Notes,
                NotesUpdatedAt = patient.NotesUpdatedAt,
                UpcomingAppointments = upcomingAppointments.Select(MapToAppointmentSummary).ToList(),
                PastAppointments = pastAppointments.Select(MapToAppointmentSummary).ToList(),
                RecentCalls = recentCalls,
                Clinical = PatientClinicalMapper.ToDto(patient)
            };
        }

        public async Task<bool> UpdatePatientNotesAsync(string patientId, string? notes)
        {
            var patient = await _userRepository.GetByIdAsync(patientId);
            if (patient == null || !string.Equals(patient.Role, "Patient", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            patient.Notes = notes;
            patient.NotesUpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(patient);
            return true;
        }

        public async Task<PatientDetailsDto?> UpdatePatientAsync(string patientId, PatientUpdateDto dto)
        {
            var patient = await _userRepository.GetByIdAsync(patientId);
            if (patient == null || !string.Equals(patient.Role, "Patient", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            patient.FullName = dto.FullName;
            patient.PhoneNumber = dto.PhoneNumber;
            patient.Address = dto.Address;

            // Email changes go through UserManager so the normalized columns stay
            // consistent. Seeded accounts use the email as their username, so keep
            // them in sync only when that is currently the case.
            var emailChanged = !string.Equals(patient.Email, dto.Email, StringComparison.OrdinalIgnoreCase);
            if (emailChanged)
            {
                var usernameMatchesEmail = string.Equals(patient.UserName, patient.Email, StringComparison.OrdinalIgnoreCase);

                // Note: SetEmailAsync resets EmailConfirmed to false. That's fine
                // here because patients authenticate via Supabase (not this
                // backend) and the web portal login is Personnel-only; revisit if
                // confirmed-email sign-in is ever enforced on this backend.
                var emailResult = await _userManager.SetEmailAsync(patient, dto.Email);
                if (!emailResult.Succeeded)
                {
                    throw new InvalidOperationException(string.Join("; ", emailResult.Errors.Select(e => e.Description)));
                }

                if (usernameMatchesEmail)
                {
                    var userNameResult = await _userManager.SetUserNameAsync(patient, dto.Email);
                    if (!userNameResult.Succeeded)
                    {
                        throw new InvalidOperationException(string.Join("; ", userNameResult.Errors.Select(e => e.Description)));
                    }
                }
            }

            // Persist the non-Identity fields (FullName/PhoneNumber/Address).
            await _userRepository.UpdateAsync(patient);

            return await GetPatientByIdAsync(patientId);
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
                AvailabilityNotes = appointment.Availability?.Notes ?? string.Empty,
                VisitId = appointment.Visit?.Id,
                VisitStatus = appointment.Visit?.Status,
                VisitType = appointment.Visit?.VisitType
            };
        }
    }
}
