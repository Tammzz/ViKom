using backend.DTOs;
using backend.Models;
using backend.DAL.Repositories;

namespace backend.Services
{
    public class AvailabilityService : IAvailabilityService
    {
        private readonly IAvailabilityRepository _availabilityRepository;

        public AvailabilityService(IAvailabilityRepository availabilityRepository)
        {
            _availabilityRepository = availabilityRepository;
        }

        public async Task<IEnumerable<AvailabilityDto>> GetAllAsync()
        {
            var availabilities = await _availabilityRepository.GetAllAsync();
            return availabilities.Select(MapToDto);
        }

        public async Task<AvailabilityDto?> GetByIdAsync(int id)
        {
            var availability = await _availabilityRepository.GetByIdAsync(id);
            return availability == null ? null : MapToDto(availability);
        }

        public async Task<IEnumerable<AvailabilityDto>> GetByPersonnelIdAsync(string personnelId)
        {
            var availabilities = await _availabilityRepository.GetByPersonnelIdAsync(personnelId);
            return availabilities.Select(MapToDto);
        }

        public async Task<IEnumerable<AvailabilityDto>> GetFreeAsync()
        {
            var availabilities = await _availabilityRepository.GetFreeAsync();
            return availabilities.Select(MapToDto);
        }

        public async Task<AvailabilityDto> CreateAsync(AvailabilityDto availabilityDto)
        {
            var availability = new Availability
            {
                PersonnelId = availabilityDto.PersonnelId,
                Date = DateTime.Parse(availabilityDto.Date!),
                StartTime = TimeSpan.Parse(availabilityDto.StartTime!),
                EndTime = TimeSpan.Parse(availabilityDto.EndTime!),
                Notes = availabilityDto.Notes ?? string.Empty
            };

            var created = await _availabilityRepository.CreateAsync(availability);
            var result = await _availabilityRepository.GetByIdAsync(created.Id);
            return MapToDto(result!);
        }

        public async Task<AvailabilityDto> UpdateAsync(int id, AvailabilityDto availabilityDto)
        {
            var existing = await _availabilityRepository.GetByIdAsync(id);
            if (existing == null)
                throw new InvalidOperationException("Availability not found");

            if (existing.Appointment != null)
                throw new InvalidOperationException("Cannot update booked availability");

            existing.Date = DateTime.Parse(availabilityDto.Date!);
            existing.StartTime = TimeSpan.Parse(availabilityDto.StartTime!);
            existing.EndTime = TimeSpan.Parse(availabilityDto.EndTime!);
            existing.Notes = availabilityDto.Notes ?? string.Empty;

            var updated = await _availabilityRepository.UpdateAsync(existing);
            var result = await _availabilityRepository.GetByIdAsync(updated.Id);
            return MapToDto(result!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _availabilityRepository.GetByIdAsync(id);
            if (existing == null)
                throw new InvalidOperationException("Availability not found");

            if (existing.Appointment != null)
                throw new InvalidOperationException("Cannot delete booked availability");

            return await _availabilityRepository.DeleteAsync(id);
        }

        private static AvailabilityDto MapToDto(Availability availability)
        {
            return new AvailabilityDto
            {
                Id = availability.Id,
                PersonnelId = availability.PersonnelId,
                PersonnelName = availability.Personnel?.FullName ?? string.Empty,
                Date = availability.Date.ToString("yyyy-MM-dd"),
                StartTime = availability.StartTime.ToString(@"hh\:mm"),
                EndTime = availability.EndTime.ToString(@"hh\:mm"),
                Notes = availability.Notes,
                IsBooked = availability.Appointment != null
            };
        }
    }
}
