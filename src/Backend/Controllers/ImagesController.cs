using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("images")]
    [ApiController]
    [Authorize]
    public class ImagesController : ControllerBase
    {
        private IFileService _fileService;

        public ImagesController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload/{userId}")]
        public async Task<IActionResult> SaveImage(int userId, IFormFile file)
        {
            try
            {
                var result = await _fileService.SaveImage(file, userId);
                return Ok(new { changed=true });
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetImage(int userId)
        {
            try
            {
                var imageUrl = _fileService.GetUserImage(userId);
                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("google/{userId}")]
        public async Task<IActionResult> GetGoogleImage(int userId)
        {
            return null;
        }
    }
}
