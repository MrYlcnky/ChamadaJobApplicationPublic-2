using IsBasvuru.Domain.DTOs.KimlikDogrulamaDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.Tasks;


namespace IsBasvuru.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] 
    public class KimlikDogrulamaController : BaseController
    {
        private readonly IKimlikDogrulamaService _kimlikService;

        public KimlikDogrulamaController(IKimlikDogrulamaService kimlikService)
        {
            _kimlikService = kimlikService;
        }

       

        // 2. Doğrulama Kodu Gönderme
        [HttpPost("kod-gonder")]
        [EnableRateLimiting("OtpSendRatePolicy")]
        public async Task<IActionResult> KodGonder([FromBody] KodGonderDto dto)
        {
            var response = await _kimlikService.KodGonderAsync(dto);
            return CreateActionResultInstance(response);
        }

        // 3. Kod Doğrulama
        [HttpPost("kod-dogrula")]
        [EnableRateLimiting("OtpVerifyRatePolicy")]
        public async Task<IActionResult> KodDogrula( [FromBody] KodDogrulaDto dto)
        {
            var response = await _kimlikService.KodDogrulaAsync(dto);

            return CreateActionResultInstance(response);
        }
    }
}