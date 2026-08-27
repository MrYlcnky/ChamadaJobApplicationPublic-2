using IsBasvuru.Domain.DTOs.SirketYapisiDtos.CalismaIzinBelgeTuruDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalismaIzinBelgeTuruController : BaseController
    {
        private readonly ICalismaIzinBelgeTuruService _service;

        public CalismaIzinBelgeTuruController(
            ICalismaIzinBelgeTuruService service)
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
            {
                return BadRequest("Geçersiz çalışma izin belge türü ID değeri.");
            }

            var response = await _service.GetByIdAsync(id);

            return CreateActionResultInstance(response);
        }


        [HttpPost("Create")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CalismaIzinBelgeTuruCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);

            return CreateActionResultInstance(response);
        }

        [HttpPut("Update")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Update(
            [FromBody] CalismaIzinBelgeTuruUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);

            return CreateActionResultInstance(response);
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (id <= 0)
            {
                return BadRequest("Geçersiz çalışma izin belge türü ID değeri.");
            }

            var response = await _service.DeleteAsync(id);

            return CreateActionResultInstance(response);
        }
    }
}