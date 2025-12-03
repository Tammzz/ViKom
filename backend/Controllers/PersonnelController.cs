using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonnelController : ControllerBase
    {
        private readonly ILogger<PersonnelController> _logger;

        public PersonnelController(ILogger<PersonnelController> logger)
        {
            _logger = logger;
        }

        // GET: api/personnel
        [HttpGet]
        public async Task<IActionResult> GetPersonnel()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/personnel/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPersonnelMember(string id)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/personnel
        [HttpPost]
        public async Task<IActionResult> CreatePersonnelMember([FromBody] UserDto personnelDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/personnel/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePersonnelMember(string id, [FromBody] UserDto personnelDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/personnel/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersonnelMember(string id)
        {
            // To be implemented
            return Ok();
        }
    }
}
