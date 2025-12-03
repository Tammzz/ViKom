using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly ILogger<StaffController> _logger;

        public StaffController(ILogger<StaffController> logger)
        {
            _logger = logger;
        }

        // GET: api/staff
        [HttpGet]
        public async Task<IActionResult> GetStaff()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/staff/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffMember(string id)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/staff
        [HttpPost]
        public async Task<IActionResult> CreateStaffMember([FromBody] UserDto staffDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/staff/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaffMember(string id, [FromBody] UserDto staffDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/staff/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaffMember(string id)
        {
            // To be implemented
            return Ok();
        }
    }
}
