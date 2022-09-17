using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Backend.Services.Interfaces;
using AutoMapper;
using Backend.Models;

namespace Backend.SignalR
{
   [AllowAnonymous]
    public class forumHub : Hub
    {
        private readonly IUsersService _userService;

        private readonly IMapper _mapper;

        private readonly ITopicService _topicService;

        public forumHub(IUsersService userService)
        {
            _userService=userService;
        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser =  httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(_userService.GetUsername(),otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId,groupName);
            
            var messages = "Testiramo brisanje";
            await Clients.Group(groupName).SendAsync("ReciveMessageThread",messages);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            //await Clients.Others.SendAsync("UserIsOffline",_userService.GetName());

            await base.OnDisconnectedAsync(exception);
        }
        
        private string GetGroupName(string caller,string other)
        {
            var stringCompare = string.CompareOrdinal(caller,other)<0;
            return stringCompare ? $"{caller}-{other}": $"{other}-{caller}";
        }
    }
}