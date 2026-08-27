using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeKaydiDtos;
using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailGonderimKaydiDtos;
using IsBasvuru.Domain.Entities.Yedekleme;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System.IO.Compression;

namespace IsBasvuru.Infrastructure.Services
{
    public class YedeklemeService : IYedeklemeService
    {
        private readonly IsBasvuruContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly IGoogleDriveService _googleDriveService;
        private readonly IMailService _mailService;
        private readonly IYedeklemeMailAlicisiService _yedeklemeMailAlicisiService;

        private static readonly SemaphoreSlim _yedeklemeKilidi = new(1, 1);

        public YedeklemeService(
            IsBasvuruContext context,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            IGoogleDriveService googleDriveService,
            IMailService mailService,
            IYedeklemeMailAlicisiService yedeklemeMailAlicisiService)
        {
            _context = context;
            _configuration = configuration;
            _environment = environment;
            _googleDriveService = googleDriveService;
            _mailService = mailService;
            _yedeklemeMailAlicisiService = yedeklemeMailAlicisiService;
        }

        public async Task<ServiceResponse<List<YedeklemeKaydiResponseDto>>> GetAllAsync()
        {
            var list = await _context.YedeklemeKayitlari
                .AsNoTracking()
                .OrderByDescending(x => x.BaslamaTarihi)
                .Select(x => new YedeklemeKaydiResponseDto
                {
                    Id = x.Id,
                    BaslamaTarihi = x.BaslamaTarihi,
                    TamamlanmaTarihi = x.TamamlanmaTarihi,
                    Durum = x.Durum,
                    TetiklemeTipi = x.TetiklemeTipi,
                    BaslatanKullaniciAdi = x.BaslatanKullaniciAdi,
                    ZipDosyaAdi = x.ZipDosyaAdi,
                    SqlBoyutuByte = x.SqlBoyutuByte,
                    ZipBoyutuByte = x.ZipBoyutuByte,
                    DriveYuklendiMi = x.DriveYuklendiMi,
                    DriveLink = x.DriveLink,
                    MailGonderildiMi = x.MailGonderildiMi,
                    SqlMailEkiGonderildiMi = x.SqlMailEkiGonderildiMi,
                    HataMesaji = x.HataMesaji
                })
                .ToListAsync();

            return ServiceResponse<List<YedeklemeKaydiResponseDto>>
                .SuccessResult(list);
        }

        public async Task<ServiceResponse<YedeklemeKaydiResponseDto>> GetByIdAsync(int id)
        {
            var entity = await _context.YedeklemeKayitlari
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
            {
                return ServiceResponse<YedeklemeKaydiResponseDto>
                    .FailureResult("Yedekleme kaydı bulunamadı.");
            }

            var mailGonderimleri =
                await _context.YedeklemeMailGonderimKayitlari
                    .AsNoTracking()
                    .Where(x => x.YedeklemeKaydiId == id)
                    .OrderBy(x => x.Id)
                    .Select(x =>
                        new YedeklemeMailGonderimKaydiResponseDto
                        {
                            Id = x.Id,
                            YedeklemeKaydiId = x.YedeklemeKaydiId,
                            Eposta = x.Eposta,
                            GonderildiMi = x.GonderildiMi,
                            SqlEkiGonderildiMi = x.SqlEkiGonderildiMi,
                            GonderimTarihi = x.GonderimTarihi,
                            HataMesaji = x.HataMesaji
                        })
                    .ToListAsync();

            var response = MapResponse(entity);

            response.MailGonderimleri =
                mailGonderimleri;

            return ServiceResponse<YedeklemeKaydiResponseDto>
                .SuccessResult(response);
        }

        public async Task<ServiceResponse<YedeklemeOzetDto>> GetSonBasariliAsync()
        {
            var entity = await _context.YedeklemeKayitlari
                .AsNoTracking()
                .Where(x => x.Durum == YedeklemeDurumu.Basarili)
                .OrderByDescending(x => x.TamamlanmaTarihi)
                .FirstOrDefaultAsync();

            if (entity == null)
            {
                return ServiceResponse<YedeklemeOzetDto>
                    .FailureResult(
                        "Henüz başarılı bir yedek bulunmuyor.",
                        404);
            }

            var dto = new YedeklemeOzetDto
            {
                Id = entity.Id,
                BaslamaTarihi = entity.BaslamaTarihi,
                TamamlanmaTarihi = entity.TamamlanmaTarihi,
                Durum = entity.Durum,
                TetiklemeTipi = entity.TetiklemeTipi,
                BaslatanKullaniciAdi = entity.BaslatanKullaniciAdi,
                SqlBoyutuByte = entity.SqlBoyutuByte,
                ZipBoyutuByte = entity.ZipBoyutuByte,
                DriveYuklendiMi = entity.DriveYuklendiMi,
                DriveLink = entity.DriveLink,
                MailGonderildiMi = entity.MailGonderildiMi
            };

            return ServiceResponse<YedeklemeOzetDto>
                .SuccessResult(dto);
        }

        public async Task<ServiceResponse<YedeklemeKaydiResponseDto>> OlusturAsync(
            YedeklemeTetiklemeTipi tetiklemeTipi,
            string? baslatanKullaniciAdi)
        {
            if (!await _yedeklemeKilidi.WaitAsync(0))
            {
                return ServiceResponse<YedeklemeKaydiResponseDto>
                    .FailureResult(
                        "Şu anda başka bir yedekleme işlemi devam ediyor.");
            }

            YedeklemeKaydi? kayit = null;
            string? tempKlasor = null;

            try
            {
                // ---------------------------------------------------------
                // 1. YEDEKLEME KAYDI
                // ---------------------------------------------------------

                var simdi = DateTime.Now;

                kayit = new YedeklemeKaydi
                {
                    BaslamaTarihi = simdi,
                    Durum = YedeklemeDurumu.DevamEdiyor,
                    TetiklemeTipi = tetiklemeTipi,
                    BaslatanKullaniciAdi = baslatanKullaniciAdi,

                    DriveYuklendiMi = false,
                    MailGonderildiMi = false,
                    SqlMailEkiGonderildiMi = false,

                    HataMesaji = null
                };

                await _context.YedeklemeKayitlari.AddAsync(kayit);
                await _context.SaveChangesAsync();

                // ---------------------------------------------------------
                // 2. TEMP KLASÖR
                // ---------------------------------------------------------

                tempKlasor = Path.Combine(
                    Path.GetTempPath(),
                    "IsBasvuruBackup",
                    Guid.NewGuid().ToString("N"));

                Directory.CreateDirectory(tempKlasor);

                var sqlDosyaAdi =
                    $"{simdi:dd.MM.yyyy_HH.mm}_chamadajobb.sql";

                // Windows dosya isminde ":" kullanılamaz.
                var yerelZipDosyaAdi =
                    $"{simdi:dd.MM.yyyy_HH-mm}_ChamadaJobbApp_Backup.zip";

                // Google Drive tarafında ":" kullanılabilir.
                var driveZipDosyaAdi =
                    $"{simdi:dd.MM.yyyy_HH:mm}_ChamadaJobbApp_Backup.zip";

                var sqlDosyaYolu =
                    Path.Combine(
                        tempKlasor,
                        sqlDosyaAdi);

                var zipDosyaYolu =
                    Path.Combine(
                        tempKlasor,
                        yerelZipDosyaAdi);

                // ---------------------------------------------------------
                // 3. MYSQL / MARIADB SQL YEDEĞİ
                // ---------------------------------------------------------

                await SqlYedegiOlusturAsync(
                    sqlDosyaYolu);

                if (!File.Exists(sqlDosyaYolu))
                {
                    throw new InvalidOperationException(
                        "SQL yedek dosyası oluşturulamadı.");
                }

                var sqlDosyaBilgisi =
                    new FileInfo(sqlDosyaYolu);

                if (sqlDosyaBilgisi.Length <= 0)
                {
                    throw new InvalidOperationException(
                        "SQL yedek dosyası boş oluşturuldu.");
                }

                kayit.SqlBoyutuByte =
                    sqlDosyaBilgisi.Length;

                // ---------------------------------------------------------
                // 4. SQL + WWWROOT ZIP
                // ---------------------------------------------------------

                ZipOlustur(
                    sqlDosyaYolu,
                    zipDosyaYolu);

                if (!File.Exists(zipDosyaYolu))
                {
                    throw new InvalidOperationException(
                        "ZIP yedek dosyası oluşturulamadı.");
                }

                var zipDosyaBilgisi =
                    new FileInfo(zipDosyaYolu);

                if (zipDosyaBilgisi.Length <= 0)
                {
                    throw new InvalidOperationException(
                        "ZIP yedek dosyası boş oluşturuldu.");
                }

                kayit.ZipDosyaAdi =
                    driveZipDosyaAdi;

                kayit.ZipBoyutuByte =
                    zipDosyaBilgisi.Length;

                // ---------------------------------------------------------
                // 5. GOOGLE DRIVE
                // ---------------------------------------------------------

                var driveSonuc =
                    await _googleDriveService.DosyaYukleAsync(
                        zipDosyaYolu,
                        driveZipDosyaAdi);

                if (string.IsNullOrWhiteSpace(driveSonuc.DosyaId))
                {
                    throw new InvalidOperationException(
                        "Google Drive yüklemesi tamamlandı ancak dosya ID bilgisi alınamadı.");
                }

                if (string.IsNullOrWhiteSpace(driveSonuc.DriveLink))
                {
                    throw new InvalidOperationException(
                        "Google Drive yüklemesi tamamlandı ancak dosya bağlantısı alınamadı.");
                }

                kayit.DriveYuklendiMi = true;
                kayit.DriveDosyaId = driveSonuc.DosyaId;
                kayit.DriveLink = driveSonuc.DriveLink;

                // Drive bilgilerini mailden önce kaydet.
                await _context.SaveChangesAsync();

                // ---------------------------------------------------------
                // 6. MAIL
                // ---------------------------------------------------------

                var mailGonderimKayitlari =
                    new List<YedeklemeMailGonderimKaydi>();

                try
                {
                    var aliciResponse =
                        await _yedeklemeMailAlicisiService
                            .GetAktiflerAsync();

                    if (aliciResponse.Success &&
                        aliciResponse.Data != null &&
                        aliciResponse.Data.Count > 0)
                    {
                        var alicilar = aliciResponse.Data
                            .Where(x =>
                                x.AktifMi &&
                                !string.IsNullOrWhiteSpace(x.Eposta))
                            .OrderBy(x => x.SiraNo)
                            .Select(x => x.Eposta.Trim())
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList();

                        if (alicilar.Count > 0)
                        {
                            // -------------------------------------------------
                            // MAIL ALICILARININ SNAPSHOT KAYDI
                            // -------------------------------------------------

                            mailGonderimKayitlari =
                                alicilar
                                    .Select(eposta =>
                                        new YedeklemeMailGonderimKaydi
                                        {
                                            YedeklemeKaydiId = kayit.Id,
                                            Eposta = eposta,
                                            GonderildiMi = false,
                                            SqlEkiGonderildiMi = false,
                                            GonderimTarihi = null,
                                            HataMesaji = null
                                        })
                                    .ToList();

                            await _context
                                .YedeklemeMailGonderimKayitlari
                                .AddRangeAsync(
                                    mailGonderimKayitlari);

                            await _context.SaveChangesAsync();

                            // -------------------------------------------------
                            // SQL MAIL EKİ BOYUT KONTROLÜ
                            // -------------------------------------------------

                            const long varsayilanSqlMailEkLimiti =
                                15L * 1024 * 1024;

                            var sqlMailEkLimiti =
                                _configuration.GetValue<long?>(
                                    "YedeklemeSettings:SqlMailEkMaksimumByte")
                                ?? varsayilanSqlMailEkLimiti;

                            var sqlDosyasiEklensinMi =
                                kayit.SqlBoyutuByte.HasValue &&
                                kayit.SqlBoyutuByte.Value > 0 &&
                                kayit.SqlBoyutuByte.Value <=
                                sqlMailEkLimiti;

                            // -------------------------------------------------
                            // MAIL GÖNDER
                            // -------------------------------------------------

                            var mailResponse =
                                await _mailService
                                    .YedeklemeMailiGonderAsync(
                                        alicilar,
                                        kayit.DriveLink!,
                                        driveZipDosyaAdi,
                                        sqlDosyaYolu,
                                        sqlDosyasiEklensinMi);

                            if (mailResponse.Success)
                            {
                                var gonderimTarihi =
                                    DateTime.Now;

                                kayit.MailGonderildiMi = true;

                                kayit.SqlMailEkiGonderildiMi =
                                    sqlDosyasiEklensinMi;

                                kayit.HataMesaji = null;

                                foreach (var mailKaydi
                                         in mailGonderimKayitlari)
                                {
                                    mailKaydi.GonderildiMi =
                                        true;

                                    mailKaydi.SqlEkiGonderildiMi =
                                        sqlDosyasiEklensinMi;

                                    mailKaydi.GonderimTarihi =
                                        gonderimTarihi;

                                    mailKaydi.HataMesaji =
                                        null;
                                }

                                await _context.SaveChangesAsync();
                            }
                            else
                            {
                                kayit.MailGonderildiMi =
                                    false;

                                kayit.SqlMailEkiGonderildiMi =
                                    false;

                                kayit.HataMesaji =
                                    $"Yedek oluşturuldu ancak mail gönderilemedi: {mailResponse.Message}";

                                foreach (var mailKaydi
                                         in mailGonderimKayitlari)
                                {
                                    mailKaydi.GonderildiMi =
                                        false;

                                    mailKaydi.SqlEkiGonderildiMi =
                                        false;

                                    mailKaydi.GonderimTarihi =
                                        null;

                                    mailKaydi.HataMesaji =
                                        mailResponse.Message;
                                }

                                await _context.SaveChangesAsync();
                            }
                        }
                        else
                        {
                            kayit.MailGonderildiMi =
                                false;

                            kayit.SqlMailEkiGonderildiMi =
                                false;

                            kayit.HataMesaji =
                                "Yedek oluşturuldu ancak geçerli aktif mail alıcısı bulunamadı.";
                        }
                    }
                    else
                    {
                        kayit.MailGonderildiMi =
                            false;

                        kayit.SqlMailEkiGonderildiMi =
                            false;

                        kayit.HataMesaji =
                            "Yedek oluşturuldu ancak aktif mail alıcısı bulunamadı.";
                    }
                }
                catch (Exception mailEx)
                {
                    // Mail başarısız olsa bile Drive'daki backup başarılıdır.
                    kayit.MailGonderildiMi =
                        false;

                    kayit.SqlMailEkiGonderildiMi =
                        false;

                    kayit.HataMesaji =
                        $"Yedek oluşturuldu ancak mail gönderiminde hata oluştu";

                    // Snapshot oluşturulduysa hata bilgisini de kaydet.
                    if (mailGonderimKayitlari.Count > 0)
                    {
                        foreach (var mailKaydi
                                 in mailGonderimKayitlari)
                        {
                            mailKaydi.GonderildiMi =
                                false;

                            mailKaydi.SqlEkiGonderildiMi =
                                false;

                            mailKaydi.GonderimTarihi =
                                null;

                            mailKaydi.HataMesaji =
                                mailEx.Message;
                        }
                    }

                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch
                    {
                        // Mail loglama hatası,
                        // başarılı Drive backup'ını bozmasın.
                    }
                }

                // ---------------------------------------------------------
                // 7. YEDEKLEME BAŞARILI
                // ---------------------------------------------------------

                kayit.Durum =
                    YedeklemeDurumu.Basarili;

                kayit.TamamlanmaTarihi =
                    DateTime.Now;

                await _context.SaveChangesAsync();

                var mesaj =
                    kayit.MailGonderildiMi
                        ? "Yedekleme başarıyla oluşturuldu, Google Drive'a yüklendi ve bilgilendirme maili gönderildi."
                        : "Yedekleme başarıyla oluşturuldu ve Google Drive'a yüklendi ancak bilgilendirme maili gönderilemedi.";

                var response =
                    MapResponse(kayit);

                response.MailGonderimleri =
                    mailGonderimKayitlari
                        .Select(x =>
                            new YedeklemeMailGonderimKaydiResponseDto
                            {
                                Id = x.Id,
                                YedeklemeKaydiId =
                                    x.YedeklemeKaydiId,

                                Eposta =
                                    x.Eposta,

                                GonderildiMi =
                                    x.GonderildiMi,

                                SqlEkiGonderildiMi =
                                    x.SqlEkiGonderildiMi,

                                GonderimTarihi =
                                    x.GonderimTarihi,

                                HataMesaji =
                                    x.HataMesaji
                            })
                        .ToList();

                return ServiceResponse<YedeklemeKaydiResponseDto>
                    .SuccessResult(
                        response,
                        mesaj);
            }
            catch (Exception ex)
            {
                // ---------------------------------------------------------
                // ANA YEDEKLEME HATASI
                // ---------------------------------------------------------

                if (kayit != null)
                {
                    kayit.Durum =
                        YedeklemeDurumu.Basarisiz;

                    kayit.TamamlanmaTarihi =
                        DateTime.Now;

                    kayit.HataMesaji =
                        ex.Message;

                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch
                    {
                        // Ana yedekleme hatasının üzerine
                        // log kayıt hatası yazılmasın.
                    }
                }

                return ServiceResponse<YedeklemeKaydiResponseDto>
                    .FailureResult(
                        $"Yedekleme işlemi başarısız");
            }
            finally
            {
                // ---------------------------------------------------------
                // TEMP DOSYALARINI TEMİZLE
                // ---------------------------------------------------------

                if (!string.IsNullOrWhiteSpace(tempKlasor) &&
                    Directory.Exists(tempKlasor))
                {
                    try
                    {
                        Directory.Delete(
                            tempKlasor,
                            true);
                    }
                    catch
                    {
                        // Temp temizleme hatası ana backup sonucunu bozmasın.
                    }
                }

                _yedeklemeKilidi.Release();
            }
        }

        private async Task SqlYedegiOlusturAsync(
            string sqlDosyaYolu)
        {
            var connectionString =
                _configuration.GetConnectionString(
                    "DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "DefaultConnection bulunamadı.");
            }

            await using var connection =
                new MySqlConnection(
                    connectionString);

            await connection.OpenAsync();

            using var command =
                connection.CreateCommand();

            using var backup =
                new MySqlBackup(command);

            backup.ExportToFile(
                sqlDosyaYolu);
        }

        private void ZipOlustur(
            string sqlDosyaYolu,
            string zipDosyaYolu)
        {
            using var zipStream =
                new FileStream(
                    zipDosyaYolu,
                    FileMode.Create,
                    FileAccess.Write,
                    FileShare.None);

            using var archive =
                new ZipArchive(
                    zipStream,
                    ZipArchiveMode.Create);

            // SQL dosyasını ZIP köküne ekle.
            archive.CreateEntryFromFile(
                sqlDosyaYolu,
                Path.GetFileName(sqlDosyaYolu),
                CompressionLevel.Optimal);

            var webRootPath =
                _environment.WebRootPath;

            if (string.IsNullOrWhiteSpace(webRootPath) ||
                !Directory.Exists(webRootPath))
            {
                return;
            }

            // wwwroot klasörünün tamamını ekle.
            WwwRootEkle(
                archive,
                webRootPath,
                webRootPath);
        }

        private static void WwwRootEkle(
            ZipArchive archive,
            string rootPath,
            string currentPath)
        {
            foreach (var file in Directory.GetFiles(currentPath))
            {
                var fileName =
                    Path.GetFileName(file);

                // Windows / sistem cache dosyaları backup'a dahil edilmez.
                if (fileName.Equals(
                        "Thumbs.db",
                        StringComparison.OrdinalIgnoreCase) ||
                    fileName.Equals(
                        "desktop.ini",
                        StringComparison.OrdinalIgnoreCase) ||
                    fileName.Equals(
                        ".DS_Store",
                        StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var relativePath =
                    Path.GetRelativePath(
                        rootPath,
                        file);

                var entryName =
                    Path.Combine(
                            "wwwroot",
                            relativePath)
                        .Replace("\\", "/");

                archive.CreateEntryFromFile(
                    file,
                    entryName,
                    CompressionLevel.Optimal);
            }

            foreach (var directory
                     in Directory.GetDirectories(currentPath))
            {
                WwwRootEkle(
                    archive,
                    rootPath,
                    directory);
            }
        }

        private static YedeklemeKaydiResponseDto MapResponse(
            YedeklemeKaydi entity)
        {
            return new YedeklemeKaydiResponseDto
            {
                Id = entity.Id,
                BaslamaTarihi = entity.BaslamaTarihi,
                TamamlanmaTarihi = entity.TamamlanmaTarihi,
                Durum = entity.Durum,
                TetiklemeTipi = entity.TetiklemeTipi,
                BaslatanKullaniciAdi = entity.BaslatanKullaniciAdi,
                ZipDosyaAdi = entity.ZipDosyaAdi,
                SqlBoyutuByte = entity.SqlBoyutuByte,
                ZipBoyutuByte = entity.ZipBoyutuByte,
                DriveYuklendiMi = entity.DriveYuklendiMi,
                DriveLink = entity.DriveLink,
                MailGonderildiMi = entity.MailGonderildiMi,
                SqlMailEkiGonderildiMi =
                    entity.SqlMailEkiGonderildiMi,
                HataMesaji = entity.HataMesaji
            };
        }
    }
}