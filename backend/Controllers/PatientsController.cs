using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.Services;

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
                var patients = await _patientService.GetAllPatientsAsync();
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patients");
                return StatusCode(500, "An error occurred while retrieving patients");
            }
        }
    }
}
