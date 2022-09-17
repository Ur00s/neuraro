using Microsoft.AspNetCore.SignalR;

namespace Backend.SignalR
{
    public class ChatbotHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
        public string GetConnectionId() => Context.ConnectionId;
    }
}
