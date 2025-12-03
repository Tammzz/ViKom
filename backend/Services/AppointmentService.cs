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
            // Validate that availability is free
            var availability = await _availabilityRepository.GetByIdAsync(appointmentDto.AvailabilityId);
            if (availability == null)
                throw new InvalidOperationException("Availability not found");
            
            if (availability.Appointment != null)
                throw new InvalidOperationException("Availability slot is already booked");

            var appointment = new Appointment
            {
                PatientId = appointmentDto.PatientId,
                AvailabilityId = appointmentDto.AvailabilityId,
                TaskDescription = appointmentDto.TaskDescription,
                StartTime = TimeSpan.Parse(appointmentDto.StartTime!),
                EndTime = TimeSpan.Parse(appointmentDto.EndTime!),
                Status = appointmentDto.Status ?? "Booked"
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

            existing.TaskDescription = appointmentDto.TaskDescription;
            existing.StartTime = TimeSpan.Parse(appointmentDto.StartTime!);
            existing.EndTime = TimeSpan.Parse(appointmentDto.EndTime!);
            existing.Status = appointmentDto.Status ?? existing.Status;

            var updated = await _appointmentRepository.UpdateAsync(existing);
            var result = await _appointmentRepository.GetByIdAsync(updated.Id);
            return MapToDto(result!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _appointmentRepository.DeleteAsync(id);
        }

        private static AppointmentDto MapToDto(Appointment appointment)
        {
            return new AppointmentDto
            {
                Id = appointment.Id,
                PatientId = appointment.PatientId,
                PatientName = appointment.Patient?.FullName ?? string.Empty,
                AvailabilityId = appointment.AvailabilityId,
                PersonnelId = appointment.Availability?.PersonnelId ?? string.Empty,
                PersonnelName = appointment.Availability?.Personnel?.FullName ?? string.Empty,
                Date = appointment.Availability?.Date.ToString("yyyy-MM-dd") ?? string.Empty,
                TaskDescription = appointment.TaskDescription,
                StartTime = appointment.StartTime.ToString(@"hh\:mm"),
                EndTime = appointment.EndTime.ToString(@"hh\:mm"),
                Status = appointment.Status
            };
        }
    }
}
