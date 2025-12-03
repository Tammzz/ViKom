using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvailabilityController : ControllerBase
    {
        private readonly ILogger<AvailabilityController> _logger;

        public AvailabilityController(ILogger<AvailabilityController> logger)
        {
            _logger = logger;
        }

        // GET: api/availability
        [HttpGet]
        public async Task<IActionResult> GetAvailabilities()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/availability/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAvailability(int id)
        {
            // To be implemented
            return Ok();
        }

        // GET: api/availability/personnel/{personnelId}
        [HttpGet("personnel/{personnelId}")]
        public async Task<IActionResult> GetAvailabilitiesByPersonnel(string personnelId)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/availability
        [HttpPost]
        public async Task<IActionResult> CreateAvailability([FromBody] AvailabilityDto availabilityDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/availability/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAvailability(int id, [FromBody] AvailabilityDto availabilityDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/availability/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvailability(int id)
        {
            // To be implemented
            return Ok();
        }
    }
}
