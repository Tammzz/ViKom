using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientsController : ControllerBase
    {
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(ILogger<ClientsController> logger)
        {
            _logger = logger;
        }

        // GET: api/clients
        [HttpGet]
        public async Task<IActionResult> GetClients()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/clients/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClient(string id)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/clients
        [HttpPost]
        public async Task<IActionResult> CreateClient([FromBody] UserDto clientDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/clients/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(string id, [FromBody] UserDto clientDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/clients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(string id)
        {
            // To be implemented
            return Ok();
        }
    }
}
