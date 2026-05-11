namespace backend.Services
{
    /// <summary>
    /// Stub implementation of ISupabaseIntegrationService.
    /// 
    /// This is a placeholder for future Supabase integration functionality.
    /// Methods currently return placeholder values and do not make actual Supabase calls.
    /// 
    /// Activation: Will be registered in DI when actual implementation is ready.
    /// No environment variables or API keys should be hardcoded here.
    /// </summary>
    public class SupabaseIntegrationService : ISupabaseIntegrationService
    {
        private readonly ILogger<SupabaseIntegrationService> _logger;

        public SupabaseIntegrationService(ILogger<SupabaseIntegrationService> logger)
        {
            _logger = logger;
        }

        public async Task<bool> MapUserToSupabaseProfileAsync(string localUserId, string supabaseProfileId)
        {
            _logger.LogInformation(
                "MapUserToSupabaseProfileAsync called for localUserId: {LocalUserId}, supabaseProfileId: {SupabaseProfileId}",
                localUserId,
                supabaseProfileId);

            // TODO: Implement actual mapping logic
            // 1. Validate supabaseProfileId exists in Supabase
            // 2. Update User.SupabaseProfileId in database
            // 3. Log the mapping event
            // 4. Return success/failure

            await Task.CompletedTask;
            return false; // Stub: not yet implemented
        }

        public async Task<string?> GetSupabaseProfileIdAsync(string localUserId)
        {
            _logger.LogInformation("GetSupabaseProfileIdAsync called for localUserId: {LocalUserId}", localUserId);

            // TODO: Implement actual lookup logic
            // 1. Query User table for SupabaseProfileId
            // 2. Return the ID or null if not mapped

            await Task.CompletedTask;
            return null; // Stub: not yet implemented
        }

        public async Task<bool> ValidateSupabaseProfileAsync(string supabaseProfileId)
        {
            _logger.LogInformation("ValidateSupabaseProfileAsync called for supabaseProfileId: {SupabaseProfileId}", supabaseProfileId);

            // TODO: Implement actual validation logic
            // 1. Make request to Supabase API (via environment variable configuration)
            // 2. Check if profiles.id exists
            // 3. Verify it's an active profile
            // 4. Return validation result

            await Task.CompletedTask;
            return false; // Stub: not yet implemented
        }
    }
}
