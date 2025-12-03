using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(ILogger<AppointmentsController> logger)
        {
            _logger = logger;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<IActionResult> GetAppointments()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointment(int id)
        {
            // To be implemented
            return Ok();
        }

        // GET: api/appointments/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetAppointmentsByPatient(string patientId)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] AppointmentDto appointmentDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentDto appointmentDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            // To be implemented
            return Ok();
        }
    }
}
