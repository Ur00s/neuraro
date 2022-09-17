using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IFileService
    {
        Task<List<List<object>>> LoadFile(int fileId, int from, int to);
        Task<string> SaveFile(IFormFile file, int id);
        Task<List<SavedFile>> GetFiles(int userId);
        Task<SavedFile> GetFile(int fileId);
        Task<bool> DeleteFile(int fileId);
        Task<bool> EditFile(int fileId, int i, int j, object toChange);
        Task<string> SaveImage(IFormFile file, int userID);
        string GetUserImage(int userId);
        string GetGoogleImage(int userId);
        Task<string> SaveGoogleImage(int userId,string ImageUrl);
    }
}
