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
    public class AvailabilityController : ControllerBase
    {
        private readonly IAvailabilityService _availabilityService;
        private readonly ILogger<AvailabilityController> _logger;

        public AvailabilityController(
            IAvailabilityService availabilityService,
            ILogger<AvailabilityController> logger)
        {
            _availabilityService = availabilityService;
            _logger = logger;
        }

        // GET: api/availability
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AvailabilityDto>>> GetAvailabilities()
        {
            try
            {
                var availabilities = await _availabilityService.GetAllAsync();
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availabilities");
                return StatusCode(500, "An error occurred while retrieving availabilities");
            }
        }

        // GET: api/availability/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AvailabilityDto>> GetAvailability(int id)
        {
            try
            {
                var availability = await _availabilityService.GetByIdAsync(id);
                if (availability == null)
                    return NotFound();

                return Ok(availability);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the availability");
            }
        }

        // GET: api/availability/personnel/{personnelId}
        [HttpGet("personnel/{personnelId}")]
        public async Task<ActionResult<IEnumerable<AvailabilityDto>>> GetAvailabilitiesByPersonnel(string personnelId)
        {
            try
            {
                var availabilities = await _availabilityService.GetByPersonnelIdAsync(personnelId);
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availabilities for personnel {PersonnelId}", personnelId);
                return StatusCode(500, "An error occurred while retrieving availabilities");
            }
        }

        // GET: api/availability/free
        [HttpGet("free")]
        public async Task<ActionResult<IEnumerable<AvailabilityDto>>> GetFreeAvailabilities()
        {
            try
            {
                var availabilities = await _availabilityService.GetFreeAsync();
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting free availabilities");
                return StatusCode(500, "An error occurred while retrieving free availabilities");
            }
        }

        // POST: api/availability
        [Authorize(Roles = "Personnel,Admin")]
        [HttpPost]
        public async Task<ActionResult<AvailabilityDto>> CreateAvailability([FromBody] AvailabilityDto availabilityDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Auto-assign personnel ID from logged-in user
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                availabilityDto.PersonnelId = userId;

                var created = await _availabilityService.CreateAsync(availabilityDto);
                return CreatedAtAction(nameof(GetAvailability), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating availability");
                return StatusCode(500, "An error occurred while creating the availability");
            }
        }

        // PUT: api/availability/{id}
        [Authorize(Roles = "Personnel,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAvailability(int id, [FromBody] AvailabilityDto availabilityDto)
        {
            try
            {
                if (id != availabilityDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _availabilityService.UpdateAsync(id, availabilityDto);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when updating availability {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating availability {Id}", id);
                return StatusCode(500, "An error occurred while updating the availability");
            }
        }

        // DELETE: api/availability/{id}
        [Authorize(Roles = "Personnel,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvailability(int id)
        {
            try
            {
                var result = await _availabilityService.DeleteAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when deleting availability {Id}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting availability {Id}", id);
                return StatusCode(500, "An error occurred while deleting the availability");
            }
        }
    }
}
