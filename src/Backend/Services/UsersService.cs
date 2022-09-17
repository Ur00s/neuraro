using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace Backend.Services
{
    public class UsersService : IUsersService
    {
        private DataContext _context;
        private IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IFileService _fileService;

        public UsersService(DataContext context, IConfiguration configuraion, IHttpContextAccessor httpContextAccessor,IFileService fileService)
        {
            _context = context;
            _configuration = configuraion;
            _httpContextAccessor=httpContextAccessor;
            _fileService=fileService;
        }

        public async Task<UserDto> LoginUser(UserLogin userLogin)
        {
            var user = await _context.Users.Where(u => u.Username == userLogin.Username).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("Wrong Username");
            }

            var userPass = await _context.UserPass.Where(u => u.UserId == user.Id).FirstOrDefaultAsync();

            if (!VerifyPasswordHash(userLogin.Password, userPass.PasswordHash, userPass.PasswordSalt))
            {
                throw new Exception("Wrong Password");
            }

            UserDto userDto = new UserDto();
            userDto.Id = user.Id;
            userDto.Username = user.Username;
            userDto.FirstName = user.FirstName;
            userDto.LastName = user.LastName;
            userDto.Email = user.Email;
            var image = _fileService.GetUserImage(user.Id);
            userDto.imageUrl = image;
            userDto.Token = CreateToken(user);

            return userDto;
        }
        public async Task<UserDto> LoginUserGoogle(UserRegistrationGoogle userLogin)
        {
            var user = await _context.Users.Where(u => u.Username == userLogin.Username).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("Wrong Username");
            }
            user.FirstName=userLogin.FirstName;
            user.LastName=userLogin.LastName;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            UserDto userDto = new UserDto();
            userDto.Id = user.Id;
            userDto.Username = user.Username;
            userDto.FirstName = user.FirstName;
            userDto.LastName = user.LastName;
            userDto.Email = user.Email;
            userDto.Token = CreateToken(user);

            return userDto;
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.WindowsAccountName, user.Username),
                new Claim(ClaimTypes.Name, user.FirstName+" "+user.LastName),
                new Claim("email",user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("image",_fileService.GetUserImage(user.Id))
            };

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:JWT").Value));

            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(claims: claims, expires: DateTime.Now.AddDays(1), signingCredentials: cred);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }
        public async Task<bool> RegisterUserGoogle(UserRegistrationGoogle user)
        {
            var usr = new User();
            usr.FirstName=user.FirstName;
            usr.LastName=user.LastName;
            usr.Email=user.Email;
            usr.Username=user.Username;
            await _context.Users.AddAsync(usr);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> CheckUserGoogle(UserRegistrationGoogle user)
        {
            var usr = await _context.Users.Where(u=>u.Email==user.Email).FirstOrDefaultAsync();
            if(usr!=null)
            {
                return true;
            }else{
                return false;
            }
        }
        public async Task<bool> IsGoogleUser(int id)
        {
            var usrpass = await _context.UserPass.Where(u=>u.UserId==id).FirstOrDefaultAsync();
            if(usrpass!=null)
            {
                return false;
            }
            else{
                return true;
            }
        }
        public async Task<bool> RegisterUser(UserRegistration registration)
        {
            var userWithSameUsername = await _context.Users.Where(user => user.Username == registration.Username).FirstOrDefaultAsync();
            if (userWithSameUsername != null)
            {
                throw new Exception("User with username " + registration.Username + " already exist.");
            }

            var userWithSameEmail = await _context.Users.Where(user => user.Email == registration.Email).FirstOrDefaultAsync();
            if (userWithSameEmail != null)
            {
                throw new Exception("User with email " + registration.Email + " already exist.");
            }

            var user = new User();

            CreatePasswordHash(registration.Password, out byte[] passwordHash, out byte[] passwordSalt);

            user.Username = registration.Username;
            user.FirstName = registration.FirstName;
            user.LastName = registration.LastName;
            user.Email = registration.Email;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            UserPass userPass = new UserPass();
            userPass.UserId = user.Id;
            userPass.PasswordHash = passwordHash;
            userPass.PasswordSalt = passwordSalt;
            userPass.User = user;
            await _context.UserPass.AddAsync(userPass);
            await _context.SaveChangesAsync();

            return true;
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        public async Task<User> UpdateProfile(UserRegistration user, int id, int chpass)
        {
            var userWithSameUsername = await _context.Users.Where(u => u.Username == user.Username && u.Id != id).FirstOrDefaultAsync();
            if (userWithSameUsername != null)
            {
                throw new Exception("User with username " + user.Username + " already exist.");
            }

            var userWithSameEmail = await _context.Users.Where(u => u.Email == user.Email && u.Id != id).FirstOrDefaultAsync();
            if (userWithSameEmail != null)
            {
                throw new Exception("User with email " + user.Email + " already exist.");
            }

            User usr = await _context.Users.Where<User>(u => u.Id == id).FirstOrDefaultAsync();

            if(usr==null)
            {
                throw new Exception("Wrong user");
            }

            usr.FirstName=user.FirstName;
            usr.LastName=user.LastName;
            usr.Username=user.Username;
            usr.Email=user.Email;

            if(chpass==1){
                CreatePasswordHash(user.Password,out byte[] passwordHash,out byte[] passwordSalt);
                var userPass = await _context.UserPass.Where(u => u.UserId == usr.Id).FirstOrDefaultAsync();
                userPass.PasswordSalt = passwordSalt;
                userPass.PasswordHash = passwordHash;
                _context.UserPass.Update(userPass);
                
                //usr.PasswordHash=passwordHash;
                //usr.PasswordSalt=passwordSalt;
            }
            
            _context.Users.Update(usr);
            await _context.SaveChangesAsync();
            return usr;
        }

        public async Task<List<User>> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new Exception("User with this ID doesn't exist");
            }
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return await _context.Users.ToListAsync();
        }

        public async Task<List<User>> SetAdmin(int id, int pd)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                throw new Exception("User with this ID doesn't exist");
            }

            user.Role = pd;
            await _context.SaveChangesAsync();

            return await _context.Users.ToListAsync();
        }

        public async Task<List<User>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            if (users == null)
            {
                throw new Exception("Error fetching all users...");
            }
            return users;
        }

        public async Task<object> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new Exception("User with this ID doesn't exist");
            }
            var imageUrl = _fileService.GetUserImage(id);
            return new {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Username,
                user.Email,
                imageUrl
            };
        }
        public int GetId()
        {
            int result=-1;

            if (_httpContextAccessor.HttpContext != null)
            {
                result = int.Parse(_httpContextAccessor.HttpContext.User?.FindFirstValue("id"));
            }

            return result;
        }
        public string GetName()
        {
            var result = string.Empty;

            if (_httpContextAccessor.HttpContext != null)
            {
                result = _httpContextAccessor.HttpContext.User?.FindFirstValue(ClaimTypes.Name);
            }

            return result;
        }
        public string GetUsername()
        {
            var result = string.Empty;
            if(_httpContextAccessor.HttpContext != null)
            {
                result = _httpContextAccessor.HttpContext.User?.FindFirstValue(ClaimTypes.WindowsAccountName);
            }
            return result;
        }
    }
}
