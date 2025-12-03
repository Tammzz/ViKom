using backend.Models;

namespace backend.DAL.Repositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(string id);
        Task<IEnumerable<User>> GetByRoleAsync(string role);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(string id);
        Task<bool> SaveChangesAsync();
    }
}
