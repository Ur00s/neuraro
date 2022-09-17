using Backend.Models;
using Backend.Services.Interfaces;
using Backend.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("topic")]
    [ApiController]
    public class TopicsController : ControllerBase
    {
        private readonly ITopicService _topicService;
        
        private IHubContext<PresenceHub> _hub;

        public TopicsController(ITopicService topicService,IHubContext<PresenceHub> hub)
        {
            _topicService = topicService;
            _hub=hub;
        }

        [HttpGet, AllowAnonymous]
        public async Task<ActionResult<List<Topic>>> GetTopics()
        {
            try
            {
                var topics = await _topicService.GetAllTopics();
                return Ok(topics);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}"), AllowAnonymous]
        public async Task<ActionResult<Topic>> GetTopic(int id)
        {
            try
            {
                var topic = await _topicService.GetTopic(id);
                return Ok(topic);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("insert")]
        public async Task<ActionResult<Topic>> InsertTopic(Topic topic)
        {
            try
            {
                topic.CreationDate=DateTime.Now;
                var topics = await _topicService.InsertTopic(topic);
                _hub.Clients.All.SendAsync("AddTopic",topic);
                return Ok(topics);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("comments/{id}"), AllowAnonymous]
        public async Task<ActionResult<List<TopicDetail>>> GetComments(int id)
        {
            try
            {
                return Ok(await _topicService.GetComments(id));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpGet("likes/{id}"), AllowAnonymous]
        public async Task<ActionResult<List<Likes>>> GetLikes(int id)
        {
            try
            {
                return Ok(await _topicService.GetLikes(id));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("insert/comment")]
        public async Task<ActionResult<List<TopicDetail>>> InsertComment(TopicDetail comment){
            try
            {
                var temp = await _topicService.InsertComment(comment);
                await _hub.Clients.All.SendAsync("insertComment",temp);
                return Ok(temp);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("isLiked/{uid}/{cid}")]
        public async Task<ActionResult<bool>> isItLiked(int uid, int cid)
        {
            try
            {
                return Ok(await _topicService.isItLiked(uid,cid));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("like/{uid}/{cid}/{likeOrNot}")]
        public async Task<bool> LikeDislike(int uid,int cid,bool likeOrNot)
        {
            var temp = new HubLikes();
            temp.id=cid;
            var answer = await _topicService.LikeDislike(uid,cid,likeOrNot);
            temp.response=answer;
            temp.LikeOrDislike=likeOrNot;
            await _hub.Clients.All.SendAsync("LikeDiseLike",temp);
            return answer;
        }

        [HttpGet("delete/comment/{id}")]
        public async Task<bool> deleteComment(int id)
        {
            await _hub.Clients.All.SendAsync("deleteComment",id.ToString());
            return await _topicService.deleteCommet(id);
        }

        [HttpPost("comment/edit/{id}")]
        public async Task<bool> editComment(int id,[FromBody] string comment)
        {
            var answer = await _topicService.editComment(id,comment);
            var temp = new HubComEdit();
            temp.id=id;
            temp.response=answer;
            temp.newbody=comment;
            await _hub.Clients.All.SendAsync("EditComment",temp);
            return answer;

        }

        [HttpPost("delete")]
        public async Task<bool> deleteTopic([FromBody] Temp details)
        {
            var tempTopic = await _topicService.GetTopic(details.Id);
            //await _hub.Clients.Client(details.connectionId).SendAsync("TopicDelete","Obrisao si "+tempTopic.Title);
            await _hub.Clients.All.SendAsync("TopicDelete",tempTopic.Id);
            return await _topicService.DeleteTopic(details.Id);
        }

        [HttpPost("edit/{id}")]
        public async Task<bool> editTopic(int id,[FromBody] string newBody)
        {
            
            var answer = await _topicService.EditTopic(id,newBody);
            var temp = new HubComEdit();
            temp.id=id;
            temp.response=answer;
            temp.newbody=newBody;
            await _hub.Clients.All.SendAsync("editTopic",temp);
            return answer;
        } 
        [HttpGet("test"),AllowAnonymous]
        public IActionResult Get()
        {
            _hub.Clients.User(2.ToString()).SendAsync("test","TEST TES TTEST");
            return Ok(new { Message = "Request completed"});
        }
    }
}