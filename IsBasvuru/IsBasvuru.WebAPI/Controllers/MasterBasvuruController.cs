using IsBasvuru.Domain.DTOs.BasvuruSevkDtos;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Infrastructure.Services;
using IsBasvuru.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MasterBasvuruController : BaseController
    {
        private readonly IMasterBasvuruService _service;

        public MasterBasvuruController(IMasterBasvuruService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetAll()
        {
            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId)
                    ? sId
                    : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId)
                    ? dId
                    : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId)
                    ? aId
                    : null;

            switch (roleId)
            {
                case 1: // SuperAdmin
                case 2: // Admin
                case 3: // IkAdmin
                case 4: // IK
                    break;

                case 5: // Genel Müdür
                    if (!subeId.HasValue || !alanId.HasValue)
                        return Forbid();
                    break;

                case 6: // Departman Müdürü
                    if (!subeId.HasValue || !departmanId.HasValue)
                        return Forbid();
                    break;

                case 7: // Mali İşler Müdürü
                    if (!subeId.HasValue)
                        return Forbid();
                    break;

                default:
                    return Forbid();
            }

            var response = await _service.GetAllAsync(
                roleId,
                subeId,
                departmanId,
                alanId);

            return CreateActionResultInstance(response);
        }

        [HttpGet("GetAllOzet")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetAllOzet([FromQuery] MasterBasvuruOzetFiltreDto filtre)
        {
            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId)
                    ? sId
                    : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId)
                    ? dId
                    : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId)
                    ? aId
                    : null;

            switch (roleId)
            {
                case 1: // SuperAdmin
                case 2: // Admin
                case 3: // IkAdmin
                case 4: // IK
                    break;

                case 5: // Genel Müdür
                    if (!subeId.HasValue || !alanId.HasValue)
                        return Forbid();
                    break;

                case 6: // Departman Müdürü
                    if (!subeId.HasValue || !departmanId.HasValue)
                        return Forbid();
                    break;

                case 7: // Mali İşler Müdürü
                    if (!subeId.HasValue)
                        return Forbid();
                    break;

                default:
                    return Forbid();
            }
            var response = await _service.GetAllOzetAsync( roleId, subeId, departmanId, alanId, filtre);

            return CreateActionResultInstance(response);
        }

        [HttpGet("GetById/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (id <= 0)
                return BadRequest("Geçersiz ID.");

            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId)
                    ? sId
                    : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId)
                    ? dId
                    : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId)
                    ? aId
                    : null;

            switch (roleId)
            {
                case 1: // SuperAdmin
                case 2: // Admin
                case 3: // IkAdmin
                case 4: // IK
                    break;

                case 5: // Genel Müdür
                    if (!subeId.HasValue || !alanId.HasValue)
                        return Forbid();
                    break;

                case 6: // Departman Müdürü
                    if (!subeId.HasValue || !departmanId.HasValue)
                        return Forbid();
                    break;

                case 7: // Mali İşler Müdürü
                    if (!subeId.HasValue)
                        return Forbid();
                    break;

                default:
                    return Forbid();
            }

            var response = await _service.GetByIdAsync(
                id,
                roleId,
                subeId,
                departmanId,
                alanId);

            return CreateActionResultInstance(response);
        }

        [HttpPut("Update")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> Update([FromBody] MasterBasvuruUpdateDto dto)
        {
            var response = await _service.UpdateAsync(dto);
            return CreateActionResultInstance(response);
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            var response = await _service.DeleteAsync(id);
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetNotifications")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,GenelMudur,DepartmanMudur,MaliIslerMudur")]
        public async Task<IActionResult> GetNotifications()
        {
            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId)
                    ? sId
                    : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId)
                    ? dId
                    : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId)
                    ? aId
                    : null;

            switch (roleId)
            {
                case 1: // SuperAdmin
                case 2: // Admin
                case 3: // IkAdmin
                case 4: // IK
                case 5: // Genel Müdür
                case 7: // Mali İşler Müdürü
                    break;

                case 6: // Departman Müdürü
                    if (!departmanId.HasValue)
                        return Forbid();
                    break;

                default:
                    return Forbid();
            }

            var result = await _service.GetOnayBekleyenBildirimlerAsync(
                roleId,
                subeId,
                departmanId,
                alanId);

            return CreateActionResultInstance(result);
        }

        [HttpPost("SevkEt")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK")]
        public async Task<IActionResult> SevkEt([FromBody] SevkEtRequestDto request)
        {
            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            if (roleId != 1 &&
                roleId != 2 &&
                roleId != 3 &&
                roleId != 4)
            {
                return Forbid();
            }

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId) &&
                sId > 0
                    ? sId
                    : null;

            var response = await _service.SevkEtAsync(
                request,
                subeId
            );

            return CreateActionResultInstance(response);
        }

        [HttpPost("DepartmanDegerlendir")]
        [Authorize(Roles = "SuperAdmin,DepartmanMudur")]
        public async Task<IActionResult> DepartmanDegerlendir( [FromBody] BasvuruSevkDegerlendirmeDto dto)
        {
            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Forbid();

            int? subeId =
                int.TryParse(User.FindFirst("SubeId")?.Value, out int sId)
                    ? sId
                    : null;

            int? tokenDepartmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId)
                    ? dId
                    : null;

            int finalDepartmanId;

            if (roleId == 1) // SuperAdmin
            {
                if (!dto.DepartmanId.HasValue || dto.DepartmanId.Value <= 0)
                    return BadRequest("İşlem yapılacak departman seçilmelidir.");

                finalDepartmanId = dto.DepartmanId.Value;
                subeId = null;
            }
            else if (roleId == 6) // Departman Müdürü
            {
                if (!subeId.HasValue || !tokenDepartmanId.HasValue)
                    return Forbid();

                finalDepartmanId = tokenDepartmanId.Value;
            }
            else
            {
                return Forbid();
            }

            var response = await _service.DepartmanDegerlendirAsync(
                dto,
                subeId,
                finalDepartmanId);

            return CreateActionResultInstance(response);
        }
    }
}