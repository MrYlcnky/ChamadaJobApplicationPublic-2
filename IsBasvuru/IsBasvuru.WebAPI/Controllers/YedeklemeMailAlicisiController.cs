using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailAlicisiDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class YedeklemeMailAlicisiController : BaseController
    {
        private readonly IYedeklemeMailAlicisiService _service;

        public YedeklemeMailAlicisiController(IYedeklemeMailAlicisiService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _service.GetAllAsync();
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetAktifler")]
        public async Task<IActionResult> GetAktifler()
        {
            var response = await _service.GetAktiflerAsync();
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
                return BadRequest("Geçersiz ID.");

            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] YedeklemeMailAlicisiCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] YedeklemeMailAlicisiUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
                return BadRequest("Geçersiz ID.");

            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}