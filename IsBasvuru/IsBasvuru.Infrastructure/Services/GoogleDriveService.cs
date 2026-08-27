using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Google.Apis.Upload;
using IsBasvuru.Domain.DTOs.YedeklemeDtos;
using IsBasvuru.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using DriveFile = Google.Apis.Drive.v3.Data.File;

namespace IsBasvuru.Infrastructure.Services
{
    public class GoogleDriveService : IGoogleDriveService
    {
        private readonly IConfiguration _configuration;

        private const string BackupKlasorAdi =
            "Chamada Job Application Backup";

        public GoogleDriveService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<GoogleDriveYuklemeSonucuDto> DosyaYukleAsync(
            string dosyaYolu,
            string dosyaAdi)
        {
            if (!File.Exists(dosyaYolu))
                throw new FileNotFoundException(
                    "Drive'a yüklenecek dosya bulunamadı.",
                    dosyaYolu);

            using var driveService = DriveServisiOlustur();

            var klasorId = await BackupKlasorunuGetirVeyaOlusturAsync(
                driveService);

            var metadata = new DriveFile
            {
                Name = dosyaAdi,
                Parents = new List<string>
                {
                    klasorId
                }
            };

            await using var stream = new FileStream(
                dosyaYolu,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                1024 * 1024,
                FileOptions.Asynchronous | FileOptions.SequentialScan);

            var uploadRequest = driveService.Files.Create(
                metadata,
                stream,
                "application/zip");

            uploadRequest.Fields = "id,name,webViewLink";

            var progress = await uploadRequest.UploadAsync();

            if (progress.Status != UploadStatus.Completed)
            {
                var hata = progress.Exception?.Message
                           ?? "Bilinmeyen Google Drive yükleme hatası.";

                throw new InvalidOperationException(
                    $"Google Drive yüklemesi tamamlanamadı: {hata}");
            }

            var yuklenenDosya = uploadRequest.ResponseBody;

            if (yuklenenDosya == null ||
                string.IsNullOrWhiteSpace(yuklenenDosya.Id))
            {
                throw new InvalidOperationException(
                    "Google Drive dosya bilgisi alınamadı.");
            }

            var driveLink = !string.IsNullOrWhiteSpace(
                yuklenenDosya.WebViewLink)
                ? yuklenenDosya.WebViewLink
                : $"https://drive.google.com/file/d/{yuklenenDosya.Id}/view";

            return new GoogleDriveYuklemeSonucuDto
            {
                DosyaId = yuklenenDosya.Id,
                DriveLink = driveLink
            };
        }

        private DriveService DriveServisiOlustur()
        {
            var clientId =
                _configuration["GoogleDriveSettings:ClientId"];

            var clientSecret =
                _configuration["GoogleDriveSettings:ClientSecret"];

            var refreshToken =
                _configuration["GoogleDriveSettings:RefreshToken"];

            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException(
                    "GoogleDriveSettings:ClientId bulunamadı.");

            if (string.IsNullOrWhiteSpace(clientSecret))
                throw new InvalidOperationException(
                    "GoogleDriveSettings:ClientSecret bulunamadı.");

            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new InvalidOperationException(
                    "GoogleDriveSettings:RefreshToken bulunamadı.");

            var flow = new GoogleAuthorizationCodeFlow(
                new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    },
                    Scopes = new[]
                    {
                        DriveService.Scope.DriveFile
                    }
                });

            var token = new TokenResponse
            {
                RefreshToken = refreshToken
            };

            var credential = new UserCredential(
                flow,
                "ChamadaJobApplicationBackup",
                token);

            return new DriveService(
                new BaseClientService.Initializer
                {
                    HttpClientInitializer = credential,
                    ApplicationName =
                        "Chamada Job Application Backup"
                });
        }

        private async Task<string> BackupKlasorunuGetirVeyaOlusturAsync(
            DriveService driveService)
        {
            var listeRequest = driveService.Files.List();

            listeRequest.Q =
                $"name = '{BackupKlasorAdi}' " +
                "and mimeType = 'application/vnd.google-apps.folder' " +
                "and trashed = false";

            listeRequest.Spaces = "drive";
            listeRequest.Fields = "files(id,name)";

            var sonuc = await listeRequest.ExecuteAsync();

            var mevcutKlasor = sonuc.Files?.FirstOrDefault();

            if (mevcutKlasor != null)
                return mevcutKlasor.Id;

            var klasorMetadata = new DriveFile
            {
                Name = BackupKlasorAdi,
                MimeType = "application/vnd.google-apps.folder"
            };

            var olusturRequest =
                driveService.Files.Create(klasorMetadata);

            olusturRequest.Fields = "id,name";

            var yeniKlasor =
                await olusturRequest.ExecuteAsync();

            if (string.IsNullOrWhiteSpace(yeniKlasor.Id))
                throw new InvalidOperationException(
                    "Google Drive backup klasörü oluşturulamadı.");

            return yeniKlasor.Id;
        }
    }
}