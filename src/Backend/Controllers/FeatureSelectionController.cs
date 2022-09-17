using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("feature")]
    [ApiController]
    [Authorize]
    public class FeatureSelectionController : ControllerBase
    {
        private IConfiguration _configuration;
        private IFileService _fileServce;

        public FeatureSelectionController(IConfiguration configuration, IFileService fileServce)
        {
            _configuration = configuration;
            _fileServce = fileServce;
        }

        [HttpPost("/regression/{fileId}")]
        public async Task<IActionResult> FindFeatureSelection(int fileId, FeatureDataRegression featureData)
        {
            try
            {
                var file = await _fileServce.GetFile(fileId);
                featureData.FilePath = file.FilePath;
                var result = await Services.HttpRequest.SendPostRequest<FeatureSelectionRegression, FeatureDataRegression>(_configuration.GetSection("WebService:Url").Value + "feature-regression", featureData);
                return Ok(result);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
