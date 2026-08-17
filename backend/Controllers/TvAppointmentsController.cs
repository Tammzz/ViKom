using backend.DAL.Repositories;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    /// <summary>
    /// Device-facing endpoints for the Android TV app.
    ///
    /// Deliberately a separate controller rather than extra actions on
    /// <see cref="AppointmentsController"/>: that class carries a class-level
    /// [Authorize] for the portal's own scheme, and combining it with an
    /// action-level scheme override works only through subtle metadata-merging
    /// rules that a later refactor could silently change. Keeping the TV surface in
    /// its own file also means it can be rate-limited or locked down on its own.
    ///
    /// Authenticates Supabase-issued tokens, since the TV app signs its patients in
    /// against Supabase rather than against this backend.
    /// </summary>
    [Authorize(AuthenticationSchemes = SupabaseAuthentication.Scheme)]
    [ApiController]
    [Route("api/tv/appointments")]
    public class TvAppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<TvAppointmentsController> _logger;

        public TvAppointmentsController(
            IAppointmentService appointmentService,
            IUserRepository userRepository,
            ILogger<TvAppointmentsController> logger)
        {
            _appointmentService = appointmentService;
            _userRepository = userRepository;
            _logger = logger;
        }

        // GET: api/tv/appointments/mine
        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetMine()
        {
            try
            {
                // "sub" rather than ClaimTypes.NameIdentifier: the Supabase scheme
                // sets MapInboundClaims = false so this stays the Supabase profile
                // UUID and can't be confused with our own Identity GUID.
                var supabaseProfileId = User.FindFirstValue("sub")?.Trim();

                if (string.IsNullOrEmpty(supabaseProfileId))
                {
                    return Unauthorized();
                }

                var user = await _userRepository.GetBySupabaseProfileIdAsync(supabaseProfileId);

                if (user == null)
                {
                    // A 404 rather than an empty list, on purpose. An unmapped
                    // profile is a configuration fault, and returning [] would make
                    // it indistinguishable from "you genuinely have no
                    // appointments" — the TV app surfaces it as its own distinct
                    // "not linked" state instead. This log line is the quickest way
                    // to diagnose it.
                    _logger.LogWarning(
                        "No local user is linked to Supabase profile {SupabaseProfileId}",
                        supabaseProfileId);

                    return NotFound("No patient is linked to this Supabase profile.");
                }

                if (user.Role != "Patient")
                {
                    _logger.LogWarning(
                        "User {UserId} with role {Role} is linked to Supabase profile " +
                        "{SupabaseProfileId} but is not a patient",
                        user.Id,
                        user.Role,
                        supabaseProfileId);

                    return Forbid();
                }

                var appointments = await _appointmentService.GetByPatientIdAsync(user.Id);

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointments for the signed-in TV user");
                return StatusCode(500, "An error occurred while retrieving appointments");
            }
        }
    }
}
