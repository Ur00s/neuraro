using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class NotificationsService : INotifications
    {
        private readonly DataContext _context;

        public NotificationsService(DataContext context)
        {
            _context = context;
        }

        public async Task<Notifications> InsertNotification(Notifications notif)
        {
            var usr = await _context.Users.FindAsync(notif.UserID);
            if(usr==null)
                throw new Exception("error");
            notif.user=usr;
            await _context.Notifications.AddAsync(notif);
            await _context.SaveChangesAsync();
            return notif;
        }
        public async Task<List<Notifications>> AllUserNotification(int UserID)
        {
            var notifs = await _context.Notifications.Where(u=>u.UserID==UserID).ToListAsync();

            foreach (var noti in notifs)
            {
                var user = await _context.Users.FindAsync(UserID);
                noti.user=user;   
            }

            return notifs;
        }
        public async Task<Notifications> DeleteNotification(int id)
        {
            var noti = await _context.Notifications.FindAsync(id);
            var user = await _context.Users.FindAsync(noti.UserID);
            noti.user=user;
            _context.Notifications.Remove(noti);
            await _context.SaveChangesAsync();
            return noti;
        }
    }
}
