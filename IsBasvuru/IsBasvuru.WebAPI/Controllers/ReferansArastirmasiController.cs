using IsBasvuru.Domain.DTOs.ReferansArastirmasiDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Sınıf seviyesinde sadece sisteme giriş yapılmış olmasını zorunlu kılıyoruz
    public class ReferansArastirmasiController : BaseController
    {
        private readonly IReferansArastirmasiService _service;

        public ReferansArastirmasiController(IReferansArastirmasiService service)
        {
            _service = service;
        }

        [HttpGet("GetByMasterBasvuruId/{masterBasvuruId}")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetByMasterBasvuruId([FromRoute] int masterBasvuruId)
        {
            var response = await _service.GetByMasterBasvuruIdAsync(masterBasvuruId);
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetById/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var response = await _service.GetByIdAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpPost("Create")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK")]
        public async Task<IActionResult> Create([FromBody] ReferansArastirmasiCreateDto dto)
        {
            var response = await _service.CreateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpPut("Update")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK")]
        public async Task<IActionResult> Update([FromBody] ReferansArastirmasiUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }
    }
}