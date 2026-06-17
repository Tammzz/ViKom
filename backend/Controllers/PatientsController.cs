using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize(Roles = "Personnel")]
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly ICallLogService _callLogService;
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(
            IPatientService patientService,
            ICallLogService callLogService,
            ILogger<PatientsController> logger)
        {
            _patientService = patientService;
            _callLogService = callLogService;
            _logger = logger;
        }

        // GET: api/patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientListDto>>> GetPatients()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var patients = await _patientService.GetLinkedPatientsAsync(userId);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patients");
                return StatusCode(500, "An error occurred while retrieving patients");
            }
        }

        // GET: api/patients/all
        [HttpGet("all")]
        [Authorize(Roles = "Personnel")]
        public async Task<ActionResult<IEnumerable<PatientListDto>>> GetAllPatients()
        {
            try
            {
                var patients = await _patientService.GetAllPatientsAsync();
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all patients");
                return StatusCode(500, "An error occurred while retrieving patients");
            }
        }

        // GET: api/patients/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDetailsDto>> GetPatientById(string id)
        {
            try
            {
                var patient = await _patientService.GetPatientByIdAsync(id);
                if (patient == null)
                {
                    return NotFound();
                }

                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patient {PatientId}", id);
                return StatusCode(500, "An error occurred while retrieving the patient");
            }
        }

        // PUT: api/patients/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<PatientDetailsDto>> UpdatePatient(string id, [FromBody] PatientUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updated = await _patientService.UpdatePatientAsync(id, dto);
                if (updated == null)
                {
                    return NotFound();
                }

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when updating patient {PatientId}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating patient {PatientId}", id);
                return StatusCode(500, "An error occurred while updating the patient");
            }
        }

        // PUT: api/patients/{id}/notes
        [HttpPut("{id}/notes")]
        public async Task<IActionResult> UpdatePatientNotes(string id, [FromBody] PatientNotesUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updated = await _patientService.UpdatePatientNotesAsync(id, dto.Notes);
                if (!updated)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notes for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while updating the patient notes");
            }
        }

        // POST: api/patients/{id}/calls
        [HttpPost("{id}/calls")]
        public async Task<ActionResult<CallLogDto>> LogCall(string id)
        {
            try
            {
                var personnelId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(personnelId))
                {
                    return Unauthorized();
                }

                var created = await _callLogService.CreateAsync(id, personnelId);
                if (created == null)
                {
                    return NotFound();
                }

                return Ok(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging call for patient {PatientId}", id);
                return StatusCode(500, "An error occurred while logging the call");
            }
        }

        // PUT: api/patients/{id}/calls/{callId}
        [HttpPut("{id}/calls/{callId}")]
        public async Task<IActionResult> UpdateCall(string id, int callId, [FromBody] CallLogUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updated = await _callLogService.UpdateStatusAsync(id, callId, dto.Status);
                if (!updated)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating call {CallId} for patient {PatientId}", callId, id);
                return StatusCode(500, "An error occurred while updating the call");
            }
        }
    }
}
