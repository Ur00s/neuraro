using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("profile"), Authorize]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IUsersService _usersService;

        public ProfileController(IUsersService usersService)
        {
            _usersService=usersService;
        }
        [HttpPost("{id}/{chpass}")]
        public async Task<IActionResult> update(int id,int chpass,[FromBody]UserRegistration user){
            await _usersService.UpdateProfile(user,id,chpass);
            return Ok(user);
        }

    }
}