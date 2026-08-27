using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;

namespace IsBasvuru.WebAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IRecaptchaService _recaptchaService;
        private readonly ILogger<AuthController> _logger;

        public AuthController( IAuthService authService, IRecaptchaService recaptchaService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _recaptchaService = recaptchaService;
            _logger = logger;
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginRatePolicy")]
        public async Task<IActionResult> Login(AdminLoginDto dto)
        {
            var ipAddress =
                HttpContext.Connection.RemoteIpAddress?.ToString()
                ?? "Bilinmiyor";

            var recaptchaValid =
                await _recaptchaService.VerifyAdminAsync(
                    dto.RecaptchaToken
                );

            if (!recaptchaValid)
            {
                _logger.LogWarning(
                    "ADMIN_LOGIN_FAILED | Kullanıcı: {KullaniciAdi} | Sebep: {Sebep} | IP: {IpAddress}",
                    dto.KullaniciAdi,
                    "reCAPTCHA doğrulaması başarısız",
                    ipAddress
                );

                return BadRequest(new
                {
                    success = false,
                    message =
                        "reCAPTCHA doğrulaması başarısız. Lütfen tekrar deneyin."
                });
            }

            var result =
                await _authService.LoginAsync(dto);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "ADMIN_LOGIN_FAILED | Kullanıcı: {KullaniciAdi} | Sebep: {Sebep} | IP: {IpAddress}",
                    dto.KullaniciAdi,
                    result.Message ?? "Kullanıcı adı veya şifre hatalı",
                    ipAddress
                );

                return BadRequest(result);
            }

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = result.Data.Expiration,
                Path = "/"
            };

            Response.Cookies.Append(
                "AuthToken",
                result.Data.Token,
                cookieOptions
            );

            _logger.LogInformation(
                "ADMIN_LOGIN_SUCCESS | KullanıcıId: {KullaniciId} | Kullanıcı: {KullaniciAdi} | Rol: {Rol} | IP: {IpAddress}",
                result.Data.UserInfo?.Id,
                dto.KullaniciAdi,
                result.Data.UserInfo?.RolAdi,
                ipAddress
            );

            return Ok(result);
        }
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var ipAddress =
                HttpContext.Connection.RemoteIpAddress?.ToString()
                ?? "Bilinmiyor";

            var kullaniciAdi =
                User.Identity?.Name
                ?? "Bilinmiyor";

            var kullaniciId =
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? "Bilinmiyor";

            Response.Cookies.Delete(
                "AuthToken",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Path = "/"
                }
            );

            _logger.LogInformation(
                "ADMIN_LOGOUT | KullanıcıId: {KullaniciId} | Kullanıcı: {KullaniciAdi} | IP: {IpAddress}",
                kullaniciId,
                kullaniciAdi,
                ipAddress
            );

            return Ok(new
            {
                success = true,
                message = "Çıkış başarılı."
            });
        }
    }
}