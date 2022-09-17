using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Backend.SignalR;

namespace Backend.Controllers
{
    [ApiController]
    [Route("notification/")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotifications _notificationService;
        private IHubContext<PresenceHub> _hub;

        public NotificationController(INotifications notificationService,IHubContext<PresenceHub> hub)
        {
            _notificationService=notificationService;
            _hub=hub;
        }
        [HttpGet("UserNotifs/{id}")]
        public async Task<List<Notifications>> GetUserNotifications(int id)
        {
            return await _notificationService.AllUserNotification(id);
        }

        [HttpPost("insert")]
        public async Task<ActionResult<Notifications>> InsertNotification([FromBody]Notifications notifi)
        {
            var answer = await _notificationService.InsertNotification(notifi);
            await _hub.Clients.All.SendAsync("insertNofifi",answer);
            return answer;
        }
        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<Notifications>> DeleteNotification(int id)
        {
            var answer = await _notificationService.DeleteNotification(id);
            await _hub.Clients.All.SendAsync("deleteNotifi",answer);
            return answer;
        }
    }
}