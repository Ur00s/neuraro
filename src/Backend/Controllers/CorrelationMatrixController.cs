using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("/")]
    [ApiController]
    [Authorize]
    public class CorrelationMatrixController : ControllerBase
    {
        private IConfiguration _configuration;
        private IFileService _fileUpload;

        public CorrelationMatrixController(IConfiguration configuration, IFileService fileUpload)
        {
            _configuration = configuration;
            _fileUpload = fileUpload;
        }

        [HttpPost("cor/{fileID}")]
        public async Task<IActionResult> GetCorrelationMatrixPK(int fileID)
        {
            try
            {
                var file = await _fileUpload.GetFile(fileID);
                var fileUrl = file.FilePath;
                return Ok(await Services.HttpRequest.SendPostRequest<CorrelationMatrixPK, object>(_configuration.GetSection("WebService:Url").Value + "cor", new { fileUrl }));
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
