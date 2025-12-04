using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.DAL.Repositories;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PersonnelController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<PersonnelController> _logger;

        public PersonnelController(
            IUserRepository userRepository,
            ILogger<PersonnelController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        // GET: api/personnel
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetPersonnel()
        {
            try
            {
                var personnel = await _userRepository.GetPersonnelAsync();
                var personnelDtos = personnel.Select(p => new UserDto
                {
                    Id = p.Id,
                    UserName = p.UserName ?? string.Empty,
                    Email = p.Email ?? string.Empty,
                    FullName = p.FullName,
                    Role = p.Role,
                    PhoneNumber = p.PhoneNumber
                });
                
                return Ok(personnelDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personnel");
                return StatusCode(500, "An error occurred while retrieving personnel");
            }
        }

        // GET: api/personnel/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetPersonnelMember(string id)
        {
            try
            {
                var personnel = await _userRepository.GetByIdAsync(id);
                if (personnel == null)
                    return NotFound();
            
                if (personnel.Role != "Personnel")
                    return StatusCode(403, "Access denied. User is not personnel.");

                var dto = new UserDto
                {
                    Id = personnel.Id,
                    UserName = personnel.UserName ?? string.Empty,
                    Email = personnel.Email ?? string.Empty,
                    FullName = personnel.FullName,
                    Role = personnel.Role,
                    PhoneNumber = personnel.PhoneNumber
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personnel member {Id}", id);
                return StatusCode(500, "An error occurred while retrieving the personnel member");
            }
        }

        // POST: api/personnel
        [HttpPost]
        public async Task<IActionResult> CreatePersonnelMember([FromBody] UserDto personnelDto)
        {
            // To be implemented in Admin module
            return StatusCode(501, "Not implemented yet");
        }

        // PUT: api/personnel/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePersonnelMember(string id, [FromBody] UserDto personnelDto)
        {
            // To be implemented in Admin module
            return StatusCode(501, "Not implemented yet");
        }

        // DELETE: api/personnel/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersonnelMember(string id)
        {
            // To be implemented in Admin module
            return StatusCode(501, "Not implemented yet");
        }
    }
}
