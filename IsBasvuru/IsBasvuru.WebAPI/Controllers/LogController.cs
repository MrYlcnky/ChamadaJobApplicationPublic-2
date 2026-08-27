using IsBasvuru.Domain.Interfaces;
using IsBasvuru.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK,DepartmanMudur,GenelMudur,MaliIslerMudur")]
    public class LogController : BaseController
    {
        private readonly ILogService _logService;

        public LogController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpGet("GetAllLogs")]
        [Authorize(Roles = "SuperAdmin,Admin,IkAdmin,IK")]
        public async Task<IActionResult> GetAllLogs()
        {
            var response = await _logService.GetAllBasvuruLogsAsync();
            return CreateActionResultInstance(response);
        }

        [HttpGet("GetBasvuruLogs/{masterBasvuruId}")]
        public async Task<IActionResult> GetBasvuruLogs([FromRoute] int masterBasvuruId)
        {
            if (masterBasvuruId <= 0)
                return BadRequest("Geçersiz Başvuru ID.");

            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Unauthorized("Kullanıcı rol bilgisi alınamadı.");

            int? subeId =
                int.TryParse(
                    User.FindFirst("SubeId")?.Value,
                    out int sId
                )
                ? sId
                : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId
                )
                ? dId
                : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId
                )
                ? aId
                : null;

            var response = await _logService.GetBasvuruLogsAsync(
                masterBasvuruId,
                roleId,
                subeId,
                departmanId,
                alanId
            );

            return CreateActionResultInstance(response);
        }


        [HttpGet("GetCvLogs/{personelId}")]
        public async Task<IActionResult> GetCvLogs([FromRoute] int personelId)
        {
            if (personelId <= 0)
                return BadRequest("Geçersiz Personel ID.");

            var roleClaimValue =
                User.FindFirst("RolId")?.Value ??
                User.FindFirst("RoleId")?.Value;

            if (!int.TryParse(roleClaimValue, out int roleId))
                return Unauthorized("Kullanıcı rol bilgisi alınamadı.");

            int? subeId =
                int.TryParse(
                    User.FindFirst("SubeId")?.Value,
                    out int sId
                )
                ? sId
                : null;

            int? departmanId =
                int.TryParse(
                    User.FindFirst("MasterDepartmanId")?.Value ??
                    User.FindFirst("DepartmanId")?.Value,
                    out int dId
                )
                ? dId
                : null;

            int? alanId =
                int.TryParse(
                    User.FindFirst("MasterAlanId")?.Value ??
                    User.FindFirst("SubeAlanId")?.Value ??
                    User.FindFirst("AlanId")?.Value,
                    out int aId
                )
                ? aId
                : null;

            var response = await _logService.GetCvLogsAsync(
                personelId,
                roleId,
                subeId,
                departmanId,
                alanId
            );

            return CreateActionResultInstance(response);
        }
    }
}