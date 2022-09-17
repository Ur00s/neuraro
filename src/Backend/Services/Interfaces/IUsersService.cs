using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IUsersService
    {
        Task<List<User>> GetAllUsers();
        Task<object> GetUserById(int id);
        Task<bool> RegisterUser(UserRegistration registration);
        Task<UserDto> LoginUser(UserLogin userLogin);
        Task<User> UpdateProfile(UserRegistration user,int id,int chpass);
        Task<List<User>> DeleteUser(int id);
        Task<List<User>> SetAdmin(int id, int pd);
        Task<bool> RegisterUserGoogle(UserRegistrationGoogle user);
        Task<bool> CheckUserGoogle(UserRegistrationGoogle user);
        Task<UserDto> LoginUserGoogle(UserRegistrationGoogle userLogin);
        Task<bool> IsGoogleUser(int id);
        int GetId();
        string GetName();
        string GetUsername();
    }
}
