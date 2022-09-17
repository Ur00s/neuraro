using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface INotifications
    {
        Task<Notifications> InsertNotification(Notifications notif);
        Task<List<Notifications>> AllUserNotification(int UserID);
        Task<Notifications> DeleteNotification(int id);
    }
}
