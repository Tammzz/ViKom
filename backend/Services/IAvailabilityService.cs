using backend.DTOs;

namespace backend.Services
{
    public interface IAvailabilityService
    {
        Task<IEnumerable<AvailabilityDto>> GetAllAsync();
        Task<AvailabilityDto?> GetByIdAsync(int id);
        Task<IEnumerable<AvailabilityDto>> GetByPersonnelIdAsync(string personnelId);
        Task<IEnumerable<AvailabilityDto>> GetFreeAsync();
        Task<AvailabilityDto> CreateAsync(AvailabilityDto availabilityDto);
        Task<AvailabilityDto> UpdateAsync(int id, AvailabilityDto availabilityDto);
        Task<bool> DeleteAsync(int id);
    }
}
