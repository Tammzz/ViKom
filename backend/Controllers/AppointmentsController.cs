using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(
            IAppointmentService appointmentService,
            ILogger<AppointmentsController> logger)
        {
            _appointmentService = appointmentService;
            _logger = logger;
        }

        /// <summary>
        /// Whether the caller must be refused access to an appointment belonging to
        /// <paramref name="appointmentPatientId"/>.
        ///
        /// A patient may only see and act on their own appointments. Personnel are
        /// unrestricted, which is how the web portal uses these endpoints. Defined
        /// once here so the read and write endpoints cannot drift apart.
        /// </summary>
        private bool IsForbiddenForCaller(string? appointmentPatientId)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (role != "Patient")
                return false;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return string.IsNullOrEmpty(userId) ||
                   !string.Equals(appointmentPatientId, userId, StringComparison.Ordinal);
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointments()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var role = User.FindFirstValue(ClaimTypes.Role);

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                IEnumerable<AppointmentDto> appointments;

                if (role == "Patient")
                {
                    appointments = await _appointmentService.GetByPatientIdAsync(userId);
                }
                else
                {
                    appointments = await _appointmentService.GetAllAsync();
                }

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointments");
                return StatusCode(500, "An error occurred while retrieving appointments");
            }
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
        {
            try
            {
                var appointment = await _appointmentService.GetByIdAsync(id);
                if (appointment == null)
                    return NotFound();

                return Ok(appointment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointment {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the appointment");
            }
        }

        // GET: api/appointments/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByPatient(string patientId)
        {
            try
            {
                if (IsForbiddenForCaller(patientId))
                {
                    _logger.LogWarning(
                        "Patient {UserId} attempted to read appointments for {PatientId}",
                        User.FindFirstValue(ClaimTypes.NameIdentifier),
                        patientId);

                    return Forbid();
                }

                var appointments = await _appointmentService.GetByPatientIdAsync(patientId);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointments for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while retrieving appointments");
            }
        }

        // GET: api/appointments/personnel/{personnelId}
        [HttpGet("personnel/{personnelId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointmentsByPersonnel(string personnelId)
        {
            try
            {
                var appointments = await _appointmentService.GetByPersonnelIdAsync(personnelId);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting appointments for personnel {PersonnelId}", personnelId);
                return StatusCode(500, "An error occurred while retrieving appointments");
            }
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] AppointmentDto appointmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // patientId arrives in the request body, so without this any
                // authenticated account could book on another patient's behalf.
                if (IsForbiddenForCaller(appointmentDto.PatientId))
                {
                    _logger.LogWarning(
                        "Patient {UserId} attempted to create an appointment for {PatientId}",
                        User.FindFirstValue(ClaimTypes.NameIdentifier),
                        appointmentDto.PatientId);

                    return Forbid();
                }

                var created = await _appointmentService.CreateAsync(appointmentDto);
                return CreatedAtAction(nameof(GetAppointment), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when creating appointment");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, "An error occurred while creating the appointment");
            }
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentDto appointmentDto)
        {
            try
            {
                if (id != appointmentDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existing = await _appointmentService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                // Ownership is checked before anything else: previously only status
                // changes were gated, so a patient could edit the tasks on any
                // appointment just by knowing its id.
                if (IsForbiddenForCaller(existing.PatientId))
                {
                    _logger.LogWarning(
                        "Patient {UserId} attempted to modify appointment {Id} belonging to {PatientId}",
                        User.FindFirstValue(ClaimTypes.NameIdentifier),
                        id,
                        existing.PatientId);

                    return Forbid();
                }

                // Only personnel may change the status (start/complete a visit).
                if (!string.IsNullOrEmpty(appointmentDto.Status) &&
                    !string.Equals(existing.Status, appointmentDto.Status, StringComparison.Ordinal) &&
                    User.FindFirstValue(ClaimTypes.Role) != "Personnel")
                {
                    return Forbid();
                }

                await _appointmentService.UpdateAsync(id, appointmentDto);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when updating appointment {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating appointment {Id}", id);
                return StatusCode(500, "An error occurred while updating the appointment");
            }
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            try
            {
                var existing = await _appointmentService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                if (IsForbiddenForCaller(existing.PatientId))
                {
                    _logger.LogWarning(
                        "Patient {UserId} attempted to cancel appointment {Id} belonging to {PatientId}",
                        User.FindFirstValue(ClaimTypes.NameIdentifier),
                        id,
                        existing.PatientId);

                    return Forbid();
                }

                var result = await _appointmentService.DeleteAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting appointment {Id}", id);
                return StatusCode(500, "An error occurred while deleting the appointment");
            }
        }
    }
}
