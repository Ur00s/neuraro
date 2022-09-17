using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("Bot")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private IFileService _fileUpload;
        private IConfiguration _configuration;

        public ChatbotController(IFileService fileUpload, IConfiguration configuration)
        {
            _fileUpload = fileUpload;
            _configuration = configuration;
        }

        [HttpPost("send")]
        public async Task<ActionResult<object>> Send([FromBody] object question)
        {
            //return Ok(question);
            return Ok(await Services.HttpRequest.SendPostRequest<object,object>(_configuration.GetSection("WebService:Url").Value + "chatbot",question));
        }
        [HttpGet("check")]
        public async Task<ActionResult<object>> check()
        {
            try
            {
                var temp = "test";
                return Ok(await Services.HttpRequest.SendPostRequest<object,object>(_configuration.GetSection("WebService:Url").Value+"test",temp));
            }catch
            {
                return false;
            }
        }
    }
}
