using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq; // Contains için gerekli
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ImageMagick;

namespace IsBasvuru.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;

        private const long MaxFileSize = 2 * 1024 * 1024; // 2 MB
        private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".heic", ".heif" };
        private readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/heic", "image/heif" };

        public ImageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<ServiceResponse<string>> UploadImageAsync(IFormFile file, string folderName, string? customName = null, string? oldFileName = null)
        {
            // 1. Dosya boş mu?
            if (file == null || file.Length == 0)
                return ServiceResponse<string>.FailureResult("Yüklenecek dosya bulunamadı veya boş.");

            // 2. Boyut Kontrolü (Maks 2MB)
            if (file.Length > MaxFileSize)
                return ServiceResponse<string>.FailureResult("Dosya boyutu 2MB'dan büyük olamaz.");

            // 3. Uzantı Kontrolü
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(fileExtension))
                return ServiceResponse<string>.FailureResult("Sadece .jpg, .jpeg, .png ve .heic/.heif uzantılı dosyalar kabul edilir.");

            // 4. MIME Type (İçerik Tipi) Kontrolü
            if (!AllowedMimeTypes.Contains(file.ContentType.ToLower()))
                return ServiceResponse<string>.FailureResult("Geçersiz dosya formatı.");

            // Klasör yolu
            string uploadFolder = Path.Combine(_env.WebRootPath, "uploads", folderName);
            if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

            // Eski dosyayı silme işlemi
            if (!string.IsNullOrEmpty(oldFileName))
            {
                string oldNameOnly = Path.GetFileName(oldFileName);
                string oldFilePath = Path.Combine(uploadFolder, oldNameOnly);

                if (File.Exists(oldFilePath))
                {
                    try { File.Delete(oldFilePath); } catch { /* Silinemezse hata verme, devam et */ }
                }
            }

            // Gelen format ne olursa olsun, sunucuda standart olarak .jpg tutacağız
            string finalExtension = ".jpg";
            string finalFileName;

            if (!string.IsNullOrEmpty(customName))
            {
                // Özel format (PersonelId_Ad_Soyad vb.) temizlenerek oluşturuluyor
                string cleanName = MakeValidFileName(customName);
                finalFileName = $"{cleanName}{finalExtension}";
            }
            else
            {
                // Rastgele isim (Guid) fallback durumu
                finalFileName = Guid.NewGuid().ToString() + "_" + MakeValidFileName(Path.GetFileNameWithoutExtension(file.FileName)) + finalExtension;
            }

            string filePath = Path.Combine(uploadFolder, finalFileName);

            try
            {
                // BÜTÜN FORMATLAR İÇİN ORTAK İŞLEM VE BOYUTLANDIRMA (Magick.NET)
                using (var stream = file.OpenReadStream())
                using (var image = new MagickImage(stream))
                {
                    // 1. Formatı Jpeg olarak ayarla (PNG şeffaflığı otomatik olarak beyaza döner)
                    image.Format = MagickFormat.Jpeg;

                    // 2. Boyutlandırma (Maksimum 800x800 piksel)
                    if (image.Width > 800 || image.Height > 800)
                    {
                        var size = new MagickGeometry(800, 800)
                        {
                            IgnoreAspectRatio = false // Orantıyı koru
                        };
                        image.Resize(size);
                    }

                    // 3. Kalite optimizasyonu (Yüksek kalite, düşük dosya boyutu)
                    image.Quality = 75;

                    // 4. Sıkıştırılmış yeni haliyle diske yaz
                    await image.WriteAsync(filePath);
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.FailureResult($"Dosya işlenirken hata oluştu");
            }

            return ServiceResponse<string>.SuccessResult(finalFileName);
        }

        public Task<ServiceResponse<bool>> DeleteImageAsync(string fileName, string folderName)
        {
            if (string.IsNullOrEmpty(fileName))
                return Task.FromResult(ServiceResponse<bool>.SuccessResult(true));

            // Güvenlik: Path Traversal (../) saldırılarını önlemek için dosya adını temizle
            fileName = Path.GetFileName(fileName);

            string filePath = Path.Combine(_env.WebRootPath, "uploads", folderName, fileName);

            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch
                {
                    return Task.FromResult(ServiceResponse<bool>.FailureResult("Dosya silinirken hata oluştu."));
                }
            }

            return Task.FromResult(ServiceResponse<bool>.SuccessResult(true));
        }

        // Türkçe karakterleri İngilizceye çevirir ve güvenli dosya adı yapar
        private string MakeValidFileName(string name)
        {
            if (string.IsNullOrEmpty(name)) return "file";

            string text = name.ToLowerInvariant();
            text = text.Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u")
                       .Replace("ş", "s").Replace("ö", "o").Replace("ç", "c")
                       .Replace(" ", "_");

            // Sadece harf, rakam, tire ve alt tireye izin ver
            text = Regex.Replace(text, @"[^a-z0-9\-_]", "");

            // Uzunluk sınırı 
            if (text.Length > 50) text = text.Substring(0, 50);

            return text;
        }
    }
}