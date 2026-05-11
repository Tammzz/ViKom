namespace backend.Services
{
    /// <summary>
    /// Interface for Supabase integration operations.
    /// Provides methods for mapping and validating user profiles with Cart's Supabase backend.
    /// 
    /// Note: This is a stub interface for future implementation. 
    /// Currently, it serves as a contract for future Supabase integration features.
    /// No actual Supabase calls are made until the service is fully implemented.
    /// </summary>
    public interface ISupabaseIntegrationService
    {
        /// <summary>
        /// Maps a local user to a Supabase profile ID.
        /// </summary>
        /// <param name="localUserId">The local ASP.NET Identity user ID</param>
        /// <param name="supabaseProfileId">The Supabase profiles.id UUID</param>
        /// <returns>True if mapping was successful; false otherwise</returns>
        Task<bool> MapUserToSupabaseProfileAsync(string localUserId, string supabaseProfileId);

        /// <summary>
        /// Retrieves the Supabase profile ID for a given local user.
        /// </summary>
        /// <param name="localUserId">The local ASP.NET Identity user ID</param>
        /// <returns>The Supabase profile ID if mapped; null if not mapped</returns>
        Task<string?> GetSupabaseProfileIdAsync(string localUserId);

        /// <summary>
        /// Validates that a Supabase profile ID exists and is accessible.
        /// </summary>
        /// <param name="supabaseProfileId">The Supabase profiles.id UUID to validate</param>
        /// <returns>True if valid; false otherwise</returns>
        Task<bool> ValidateSupabaseProfileAsync(string supabaseProfileId);
    }
}
