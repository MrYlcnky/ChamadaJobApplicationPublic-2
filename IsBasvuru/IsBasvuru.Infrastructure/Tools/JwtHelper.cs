using IsBasvuru.Domain.Entities.AdminBilgileri;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IsBasvuru.Infrastructure.Tools
{
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Admin panel için token metodu
        public string GenerateToken(PanelKullanici user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var keyValue = GetRequiredSetting(jwtSettings, "Key");
            var issuer = GetRequiredSetting(jwtSettings, "Issuer");
            var audience = GetRequiredSetting(jwtSettings, "Audience");
            var durationValue = GetRequiredSetting(jwtSettings, "DurationInMinutes");

            if (!double.TryParse(durationValue, NumberStyles.Float, CultureInfo.InvariantCulture, out var durationInMinutes))
            {
                throw new InvalidOperationException("JwtSettings:DurationInMinutes geçerli bir sayı değil.");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.KullaniciAdi),
                new Claim("AdSoyad", $"{user.Adi} {user.Soyadi}"),
                new Claim("RolId", user.RolId.ToString()),
                new Claim(ClaimTypes.Role, user.Rol?.RolAdi ?? "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(durationInMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        // Başvuru yapan aday için geçici token metodu
        public string BasvuruTokenUret(string eposta)
        {
            if (string.IsNullOrWhiteSpace(eposta))
            {
                throw new InvalidOperationException("Başvuru token üretimi için e-posta zorunludur.");
            }

            var jwtSettings = _configuration.GetSection("JwtSettings");

            var keyValue = GetRequiredSetting(jwtSettings, "Key");
            var issuer = GetRequiredSetting(jwtSettings, "Issuer");
            var audience = GetRequiredSetting(jwtSettings, "Audience");

            var normalizedEmail = eposta.Trim().ToLowerInvariant();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, normalizedEmail),
                new Claim(ClaimTypes.Role, "BasvuruYapan")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private static string GetRequiredSetting(IConfigurationSection section, string key)
        {
            var value = section[key];

            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"JwtSettings:{key} yapılandırması bulunamadı veya boş.");
            }

            return value;
        }
    }
}