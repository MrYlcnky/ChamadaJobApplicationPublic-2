namespace IsBasvuru.Domain.DTOs.AdminDtos
{
    public class AdminLoginDto
    {
        public required string KullaniciAdi { get; set; }
        public required string KullaniciSifre { get; set; }
        public required string RecaptchaToken { get; set; }
    }
}