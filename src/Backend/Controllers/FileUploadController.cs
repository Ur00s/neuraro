using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("file")]
    [ApiController]
    [Authorize]
    public class FileUploadController : ControllerBase
    {
        private IFileService _fileUpload;
        private IConfiguration _configuration;

        public FileUploadController(IFileService fileUpload, IConfiguration configuration)
        {
            _fileUpload = fileUpload;
            _configuration = configuration;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<object>> LoadFile(IFormFile file)
        {
            try
            {
                string test = "test";
                //var table = await _fileUpload.LoadFile(file);
                return Ok(new { test });
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload/{id}")]
        [DisableRequestSizeLimit, RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
        public async Task<IActionResult> SaveFile(int id, IFormFile file)
        {
            try
            {
                string name = await _fileUpload.SaveFile(file, id);
                return Ok(new { name });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<List<SavedFile>>> GetFiles(int userId)
        {
            try
            {
                return Ok(await _fileUpload.GetFiles(userId));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("load/{fileID}")]
        public async Task<ActionResult<Table>> LoadTable(int fileID)
        {
            var file = await _fileUpload.GetFile(fileID);
            if (file == null)
            {
                return BadRequest("File with this id doesn't exist!");
            }

            string fileUrl = _configuration.GetSection("AppSettings:URL").Value + file.Path;
            return Ok(await Services.HttpRequest.SendPostRequest<Table, object>(_configuration.GetSection("WebService:Url").Value + "file", new { fileUrl }));
        }

        [HttpDelete("delete/{fileId}")]
        public async Task<ActionResult<object>> DeleteFile(int fileId)
        {
            try
            {
                bool deleted = await _fileUpload.DeleteFile(fileId);
                return Ok(new { deleted });
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }


        [HttpGet]
        public async Task<IActionResult> LoadDataFromFile(int fileId, int from, int to)
        {
            try
            {
                return Ok(await _fileUpload.LoadFile(fileId, from, to));
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("edit")]
        public async Task<IActionResult> EditFile(FileChanges fileChanges)
        {
            try
            {
                var edited = await _fileUpload.EditFile(fileChanges.FileID, fileChanges.IndexI, fileChanges.IndexJ, fileChanges.Changes);
                return Ok(new { edited });
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
