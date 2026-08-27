using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class YedeklemeController : BaseController
    {
        private readonly IYedeklemeService _service;

        public YedeklemeController(IYedeklemeService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (id <= 0)
                return BadRequest("Geçersiz ID.");

            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetSonBasarili")]
        public async Task<IActionResult> GetSonBasarili()
        {
            var response = await _service.GetSonBasariliAsync();
            return CreateActionResultInstance(response);
        }

        [HttpPost("Olustur")]
        public async Task<IActionResult> Olustur()
        {
            var kullaniciAdi = User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrWhiteSpace(kullaniciAdi))
                return Unauthorized("Kullanıcı bilgisi okunamadı.");

            var response = await _service.OlusturAsync(
                YedeklemeTetiklemeTipi.Manuel,
                kullaniciAdi);

            return CreateActionResultInstance(response);
        }
    }
}