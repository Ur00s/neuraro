using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Backend.Services.Interfaces;

namespace Backend.SignalR
{
   [Authorize]
    public class PresenceHub : Hub
    {
        private static int Count = 0;
        private readonly IUsersService _userService;

        public PresenceHub(IUsersService userService)
        {
            _userService=userService;
        }
        public override async Task OnConnectedAsync()
        {
            Count++;
            await Clients.All.SendAsync("UserIsOnline",Count);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Count--;
            await Clients.All.SendAsync("UserIsOffline",Count);

            await base.OnDisconnectedAsync(exception);
        }
        public string GetConnectionId() => Context.ConnectionId;
    }
}