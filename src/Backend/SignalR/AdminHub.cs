using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Backend.Services.Interfaces;

namespace Backend.SignalR
{
   [AllowAnonymous]
    public class AdminHub : Hub
    {
        private readonly IUsersService _userService;
        
        private readonly ITopicService _topicService;

        public AdminHub(IUsersService userService,ITopicService topicService)
        {
            _userService=userService;
            _topicService=topicService;
        }

        public Task DeleteTopic(int id)
        {
            //var result = _topicService.DeleteTopic(id);
            var result = "Topic iD: "+id.ToString();
            return Clients.All.SendAsync("DeletedTopic",result);
        }
        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("AdminConnect","Radi");
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            //await Clients.All.SendAsync("AdminDeleteTopic");

            await base.OnDisconnectedAsync(exception);
        }
    }
}