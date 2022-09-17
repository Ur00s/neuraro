using Backend.Models;
using Backend.Services.Interfaces;
using Backend.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("replies/"),Authorize]
    [ApiController]
    public class RepliesController : ControllerBase
    {
        private readonly ITopicService _topicService;
        private IHubContext<PresenceHub> _hub;

        public RepliesController(ITopicService topicService,IHubContext<PresenceHub> hub)
        {
            _topicService = topicService;
            _hub=hub;
        }

        [HttpGet("{id}"),AllowAnonymous]
        public async Task<List<Reply>> GetAllReplies(int id)
        {
            return await _topicService.GetAllReplys(id);
        }
        [HttpPost("insert")]
        public async Task<Reply> InsertReply(Reply reply)
        {
            var rep = await _topicService.replyComment(reply);
            await _hub.Clients.All.SendAsync("insertReply",rep);
            return rep;
        }
        [HttpGet("isLiked/{uid}/{pid}"),AllowAnonymous]
        public async Task<ActionResult<bool>> isItLiked(int uid, int pid)
        {
            try
            {
                return Ok(await _topicService.isItLikedReply(uid,pid));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("like/{uid}/{pid}/{likeOrNot}")]
        public async Task<bool> LikeDislike(int uid,int pid,bool likeOrNot)
        {
            var hubLike = new HubLikes();
            //hubLike.id
            var answer = await _topicService.LikeDislikeReply(uid,pid,likeOrNot);
            hubLike.id=pid;
            hubLike.response=answer;
            hubLike.LikeOrDislike=likeOrNot;
            await _hub.Clients.All.SendAsync("LikeOrDislikeRep",hubLike);
            return answer;
        }
        [HttpGet("likes/{id}"), AllowAnonymous]
        public async Task<ActionResult<List<ReplyLikes>>> GetLikes(int id)
        {
            try
            {
                return Ok(await _topicService.GetReplyLikes(id));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("delete/{id}")]
        public async Task<bool> deleteReply(int id)
        {
            var rep = _topicService.GetReply(id);
            await _hub.Clients.All.SendAsync("deleteReply",rep.Result);
            
            return await _topicService.deleteReply(id);
        }
        [HttpPost("edit/{id}")]
        public async Task<bool> editComment(int id,[FromBody] string reply)
        {
            var answer = await _topicService.editReply(id,reply);
            var temp = new HubComEdit();
            temp.id=id;
            temp.response=answer;
            temp.newbody=reply;
            await _hub.Clients.All.SendAsync("editReply",temp);
            return answer;
        }
    }
}