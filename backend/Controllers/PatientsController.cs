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
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(
            IPatientService patientService,
            ILogger<PatientsController> logger)
        {
            _patientService = patientService;
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
    }
}
