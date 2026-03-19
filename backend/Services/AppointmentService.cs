using backend.DTOs;
using backend.Models;
using backend.DAL.Repositories;

namespace backend.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IAvailabilityRepository _availabilityRepository;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IAvailabilityRepository availabilityRepository)
        {
            _appointmentRepository = appointmentRepository;
            _availabilityRepository = availabilityRepository;
        }

        public async Task<IEnumerable<AppointmentDto>> GetAllAsync()
        {
            var appointments = await _appointmentRepository.GetAllAsync();
            return appointments.Select(MapToDto);
        }

        public async Task<AppointmentDto?> GetByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            return appointment == null ? null : MapToDto(appointment);
        }

        public async Task<IEnumerable<AppointmentDto>> GetByPatientIdAsync(string patientId)
        {
            var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
            return appointments.Select(MapToDto);
        }

        public async Task<IEnumerable<AppointmentDto>> GetByPersonnelIdAsync(string personnelId)
        {
            var appointments = await _appointmentRepository.GetByPersonnelIdAsync(personnelId);
            return appointments.Select(MapToDto);
        }

        public async Task<AppointmentDto> CreateAsync(AppointmentDto appointmentDto)
        {
            // Validate that availability exists and is free
            var availability = await _availabilityRepository.GetByIdAsync(appointmentDto.AvailabilityId);
            if (availability == null)
                throw new InvalidOperationException("Availability not found");
            
            if (availability.Appointment != null)
                throw new InvalidOperationException("Availability slot is already booked");

            // Ensure the availability is in the future
            var appointmentDateTime = availability.Date.Date + availability.StartTime;
            if (appointmentDateTime <= DateTime.Now)
                throw new InvalidOperationException("Cannot book appointments in the past");

            // Auto-fill start and end times from availability slot
            var appointment = new Appointment
            {
                PatientId = appointmentDto.PatientId,
                AvailabilityId = appointmentDto.AvailabilityId,
                Tasks = appointmentDto.Tasks,
                StartTime = availability.StartTime,
                EndTime = availability.EndTime,
                Status = "Booked" // Always set to Booked on creation
            };

            var created = await _appointmentRepository.CreateAsync(appointment);
            var result = await _appointmentRepository.GetByIdAsync(created.Id);
            return MapToDto(result!);
        }

        public async Task<AppointmentDto> UpdateAsync(int id, AppointmentDto appointmentDto)
        {
            var existing = await _appointmentRepository.GetByIdAsync(id);
            if (existing == null)
                throw new InvalidOperationException("Appointment not found");

            var updated = false;

            // Update tasks (only allowed >24h before appointment)
            if (!string.Equals(appointmentDto.Tasks, existing.Tasks, StringComparison.Ordinal))
            {
                var appointmentDateTime = existing.Availability.Date.Date + existing.StartTime;
                var hoursUntilAppointment = (appointmentDateTime - DateTime.Now).TotalHours;

                if (hoursUntilAppointment < 24)
                    throw new InvalidOperationException("Appointments cannot be modified less than 24 hours before the scheduled time");

                existing.Tasks = appointmentDto.Tasks;
                updated = true;
            }

            // Update status (Personnel should use this to start/complete appointments)
            if (!string.IsNullOrEmpty(appointmentDto.Status) && appointmentDto.Status != existing.Status)
            {
                var currentStatus = existing.Status;
                var newStatus = appointmentDto.Status;
                var validTransition = (currentStatus, newStatus) switch
                {
                    ("Booked", "InProgress") => true,
                    ("Booked", "Cancelled") => true,
                    ("InProgress", "Completed") => true,
                    ("InProgress", "Cancelled") => true,
                    _ => false
                };

                if (!validTransition)
                    throw new InvalidOperationException($"Invalid status transition from {currentStatus} to {newStatus}");

                // Keep existing 24h cancellation restriction
                if (newStatus == "Cancelled")
                {
                    var appointmentDateTime = existing.Availability.Date.Date + existing.StartTime;
                    var hoursUntilAppointment = (appointmentDateTime - DateTime.Now).TotalHours;

                    if (hoursUntilAppointment < 24)
                        throw new InvalidOperationException("Appointments cannot be cancelled less than 24 hours before the scheduled time");
                }

                existing.Status = newStatus;
                updated = true;
            }

            if (!updated)
            {
                return MapToDto(existing);
            }

            var updatedAppointment = await _appointmentRepository.UpdateAsync(existing);
            var result = await _appointmentRepository.GetByIdAsync(updatedAppointment.Id);
            return MapToDto(result!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new InvalidOperationException("Appointment not found");

            // Enforce 24-hour restriction for cancellation
            var appointmentDateTime = appointment.Availability.Date.Date + appointment.StartTime;
            var hoursUntilAppointment = (appointmentDateTime - DateTime.Now).TotalHours;
            
            if (hoursUntilAppointment < 24)
                throw new InvalidOperationException("Appointments cannot be cancelled less than 24 hours before the scheduled time");

            // Mark appointment as cancelled (soft delete)
            appointment.Status = "Cancelled";
            await _appointmentRepository.UpdateAsync(appointment);

            return true;
        }

        private static AppointmentDto MapToDto(Appointment appointment)
        {
            // Compute status dynamically: if past end time and status is Booked, treat as Completed
            var status = appointment.Status;
            if (status == "Booked")
            {
                var appointmentEndDateTime = appointment.Availability.Date.Date + appointment.EndTime;
                if (appointmentEndDateTime < DateTime.Now)
                {
                    status = "Completed";
                }
            }

            return new AppointmentDto
            {
                Id = appointment.Id,
                PatientId = appointment.PatientId,
                PatientName = appointment.Patient?.FullName ?? string.Empty,
                PatientAddress = appointment.Patient?.Address ?? string.Empty,
                AvailabilityId = appointment.AvailabilityId,
                PersonnelId = appointment.Availability?.PersonnelId ?? string.Empty,
                PersonnelName = appointment.Availability?.Personnel?.FullName ?? string.Empty,
                Date = appointment.Availability?.Date.ToString("yyyy-MM-dd") ?? string.Empty,
                Tasks = appointment.Tasks,
                AvailabilityNotes = appointment.Availability?.Notes ?? string.Empty,
                StartTime = appointment.StartTime.ToString(@"hh\:mm"),
                EndTime = appointment.EndTime.ToString(@"hh\:mm"),
                Status = status
            };
        }
    }
}
