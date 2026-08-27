using IsBasvuru.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace IsBasvuru.Infrastructure.Services
{
    public class RecaptchaService : IRecaptchaService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RecaptchaService> _logger;

        public RecaptchaService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<RecaptchaService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public Task<bool> VerifyAsync(string? token)
        {
            return VerifyInternalAsync(
                token,
                "Recaptcha:SecretKey"
            );
        }

        public Task<bool> VerifyAdminAsync(string? token)
        {
            return VerifyInternalAsync(
                token,
                "Recaptcha:AdminSecretKey"
            );
        }

        private async Task<bool> VerifyInternalAsync(
            string? token,
            string secretKeyConfig)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            var secretKey = _configuration[secretKeyConfig];

            var verifyUrl =
                _configuration["Recaptcha:VerifyUrl"]
                ?? "https://www.google.com/recaptcha/api/siteverify";

            if (string.IsNullOrWhiteSpace(secretKey))
            {
                _logger.LogError(
                    "reCAPTCHA SecretKey bulunamadı. Config: {Config}",
                    secretKeyConfig
                );

                return false;
            }

            try
            {
                var client = _httpClientFactory.CreateClient();

                var formData = new Dictionary<string, string>
                {
                    ["secret"] = secretKey,
                    ["response"] = token
                };

                using var content =
                    new FormUrlEncodedContent(formData);

                var httpResponse =
                    await client.PostAsync(verifyUrl, content);

                if (!httpResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "reCAPTCHA doğrulama isteği başarısız oldu. StatusCode: {StatusCode}",
                        httpResponse.StatusCode
                    );

                    return false;
                }

                var result =
                    await httpResponse.Content
                        .ReadFromJsonAsync<RecaptchaVerifyResponse>();

                if (result == null)
                {
                    _logger.LogWarning(
                        "reCAPTCHA doğrulama cevabı boş geldi."
                    );

                    return false;
                }

                if (!result.Success)
                {
                    _logger.LogWarning(
                        "reCAPTCHA doğrulaması başarısız. ErrorCodes: {ErrorCodes}",
                        result.ErrorCodes == null
                            ? ""
                            : string.Join(", ", result.ErrorCodes)
                    );
                }

                return result.Success;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "reCAPTCHA doğrulaması sırasında hata oluştu."
                );

                return false;
            }
        }

        private class RecaptchaVerifyResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("challenge_ts")]
            public DateTime? ChallengeTs { get; set; }

            [JsonPropertyName("hostname")]
            public string? Hostname { get; set; }

            [JsonPropertyName("error-codes")]
            public List<string>? ErrorCodes { get; set; }
        }
    }
}