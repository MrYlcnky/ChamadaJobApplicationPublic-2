using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using System;
using System.Text.Json.Serialization;

namespace IsBasvuru.Domain.DTOs.AdminDtos
{
    public class LoginResponseDto
    {
        [JsonIgnore]
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public virtual PanelKullaniciListDto? UserInfo { get; set; }
    }
}