using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly ILogger<PatientsController> _logger;

        public PatientsController(ILogger<PatientsController> logger)
        {
            _logger = logger;
        }

        // GET: api/patients
        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/patients/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatient(string id)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/patients
        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] UserDto patientDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/patients/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(string id, [FromBody] UserDto patientDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/patients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(string id)
        {
            // To be implemented
            return Ok();
        }
    }
}
