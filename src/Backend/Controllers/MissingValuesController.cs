using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("missingval"), Authorize]
    [ApiController]
    [Authorize]
    public class MissingValuesController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IFileService _fileService;
        private readonly IUsersService _usersService;
        public MissingValuesController(IConfiguration configuration, IFileService fileService, IUsersService usersService)
        {
            _configuration = configuration;
            _fileService = fileService;
            _usersService = usersService;
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> Post(int id, MissingValues missingValues)
        {
            try
            {
                SavedFile file = await _fileService.GetFile(id);
                missingValues.FilePath = file.FilePath;
                var result = await Services.HttpRequest.SendPostRequest<object, MissingValues>(_configuration.GetSection("WebService:Url").Value + "missingval",
                    missingValues);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
