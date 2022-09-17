using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("table")]
    [ApiController]
    [Authorize]
    public class TableController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IFileService _fileService;

        public TableController(IConfiguration configuration, IFileService fileService)
        {
            _configuration = configuration;
            _fileService = fileService;
        }

        [HttpPost]
        public async Task<IActionResult> SortTable(SortTable sort)
        {
            try
            {
                var file = await _fileService.GetFile(sort.FileId);
                var result = await Services.HttpRequest.SendPostRequest<List<List<object>>, object>(_configuration.GetSection("WebService:Url").Value + "sort",
                    new { FilePath = file.FilePath, From = sort.From, To = sort.To, Ascending = sort.Ascending, Column = sort.Column });

                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
