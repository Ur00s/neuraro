using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [ApiController]
    [Route("users/"), Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUsersService _usersService;

        public UsersController(IUsersService usersService)
        {
            _usersService=usersService;
        }

        [HttpGet]
        public async Task<ActionResult<User>> GetUsers()
        {
            try
            {
                var users = await _usersService.GetAllUsers();
                return Ok(users);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<User>> GetUsers(int id)
        {
            try
            {
                var user = _usersService.GetUserById(id);
                return Ok(user);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<List<User>>> Delete(int id)
        {
            try
            {
                var users = await _usersService.DeleteUser(id);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("admin/{id}")]
        public async Task<ActionResult<List<User>>> SetAdmin(int id, [FromBody] int pd)
        {
            try
            {
                var users = await _usersService.SetAdmin(id, pd);
                return Ok(users);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost("edit/{id}/{chpass}")]
        public async Task<ActionResult<List<User>>> Update(int id, int chpass, [FromBody] UserRegistration user)
        {
            try
            {
                await _usersService.UpdateProfile(user, id, chpass);
                var users = await _usersService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}