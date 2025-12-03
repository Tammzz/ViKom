using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly ILogger<ServiceRequestsController> _logger;

        public ServiceRequestsController(ILogger<ServiceRequestsController> logger)
        {
            _logger = logger;
        }

        // GET: api/servicerequests
        [HttpGet]
        public async Task<IActionResult> GetServiceRequests()
        {
            // To be implemented
            return Ok();
        }

        // GET: api/servicerequests/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceRequest(int id)
        {
            // To be implemented
            return Ok();
        }

        // POST: api/servicerequests
        [HttpPost]
        public async Task<IActionResult> CreateServiceRequest([FromBody] object serviceRequestDto)
        {
            // To be implemented
            return Ok();
        }

        // PUT: api/servicerequests/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateServiceRequest(int id, [FromBody] object serviceRequestDto)
        {
            // To be implemented
            return Ok();
        }

        // DELETE: api/servicerequests/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceRequest(int id)
        {
            // To be implemented
            return Ok();
        }
    }
}
