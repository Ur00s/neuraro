using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [ApiController]
    [Route("google/")]
    public class GoogleController : ControllerBase
    {
        private readonly IUsersService _usersService;

        public GoogleController(IUsersService usersService)
        {
            _usersService=usersService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> Register(UserRegistrationGoogle user)
        {
            try
            {
                await _usersService.RegisterUserGoogle(user);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("check")]
        public async Task<bool> CheckUser(UserRegistrationGoogle user)
        {
            return await _usersService.CheckUserGoogle(user);
        }
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(UserRegistrationGoogle user)
        {
            try
            {
                var userDto = await _usersService.LoginUserGoogle(user);
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("isGoogleUser/{id}")]
        public async Task<bool> isGoogleUser(int id)
        {
            return await _usersService.IsGoogleUser(id);
        }
    }
}