using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class OutliersController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;

        public OutliersController(IFileService fileService, IConfiguration configuration)
        {
            _fileService = fileService;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<ActionResult<object>> GetOutliers([FromBody] DataForOutliers data)
        {
            var file = await _fileService.GetFile(data.FileId);
            var responose = await Services.HttpRequest.SendPostRequest<object, object>(_configuration.GetSection("WebService:Url").Value + "outliers", new { FilePath = file.FilePath, ColumnName = data.ColumnName });
            return Ok(responose);
        }

        [HttpPost("delete")]
        public async Task<ActionResult<object>> DeleteOutliers([FromBody] DataForOutliers data)
        {
            var file = await _fileService.GetFile(data.FileId);
            var responose = await Services.HttpRequest.SendPostRequest<object, object>(_configuration.GetSection("WebService:Url").Value + "outliers/delete", new { FilePath = file.FilePath, ColumnName = data.ColumnName });
            return Ok(responose);
        }
    }
}
