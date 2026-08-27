using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace IsBasvuru.WebAPI.BackgroundServices
{
    public class OtomatikYedeklemeBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OtomatikYedeklemeBackgroundService> _logger;

        public OtomatikYedeklemeBackgroundService(
            IServiceScopeFactory scopeFactory,
            IConfiguration configuration,
            ILogger<OtomatikYedeklemeBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Otomatik yedekleme servisi başlatıldı.");

            // Uygulama açıldığında bir kez hemen kontrol et.
            await KontrolEtVeGerekirseYedekleAsync(
                stoppingToken);

            var kontrolDakika =
                _configuration.GetValue<int?>(
                    "YedeklemeSettings:OtomatikKontrolDakika")
                ?? 60;

            if (kontrolDakika < 1)
                kontrolDakika = 60;

            using var timer = new PeriodicTimer(
                TimeSpan.FromMinutes(kontrolDakika));

            try
            {
                while (await timer.WaitForNextTickAsync(
                    stoppingToken))
                {
                    await KontrolEtVeGerekirseYedekleAsync(
                        stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Uygulama kapanırken normal durum.
            }

            _logger.LogInformation(
                "Otomatik yedekleme servisi durduruldu.");
        }

        private async Task KontrolEtVeGerekirseYedekleAsync(
            CancellationToken stoppingToken)
        {
            try
            {
                var otomatikAktifMi =
                    _configuration.GetValue<bool?>(
                        "YedeklemeSettings:OtomatikYedeklemeAktifMi")
                    ?? false;

                if (!otomatikAktifMi)
                    return;

                var gunAraligi =
                    _configuration.GetValue<int?>(
                        "YedeklemeSettings:OtomatikYedeklemeGunAraligi")
                    ?? 7;

                if (gunAraligi < 1)
                    gunAraligi = 7;

                using var scope =
                    _scopeFactory.CreateScope();

                var context =
                    scope.ServiceProvider
                        .GetRequiredService<IsBasvuruContext>();

                var yedeklemeService =
                    scope.ServiceProvider
                        .GetRequiredService<IYedeklemeService>();

                // Manuel veya otomatik fark etmez.
                // En son gerçek başarılı Drive backup'ını baz alıyoruz.
                var sonBasariliYedekTarihi =
                    await context.YedeklemeKayitlari
                        .AsNoTracking()
                        .Where(x =>
                            x.Durum == YedeklemeDurumu.Basarili &&
                            x.DriveYuklendiMi &&
                            x.TamamlanmaTarihi.HasValue)
                        .OrderByDescending(x => x.TamamlanmaTarihi)
                        .Select(x => x.TamamlanmaTarihi)
                        .FirstOrDefaultAsync(stoppingToken);

                if (sonBasariliYedekTarihi.HasValue)
                {
                    var sonrakiYedekTarihi =
                        sonBasariliYedekTarihi.Value
                            .AddDays(gunAraligi);

                    if (DateTime.Now < sonrakiYedekTarihi)
                    {
                        _logger.LogInformation(
                            "Otomatik yedekleme zamanı henüz gelmedi. Son yedek: {SonYedek}, Sonraki: {SonrakiYedek}",
                            sonBasariliYedekTarihi.Value,
                            sonrakiYedekTarihi);

                        return;
                    }
                }

                _logger.LogInformation(
                    "Otomatik yedekleme başlatılıyor.");

                var sonuc =
                    await yedeklemeService.OlusturAsync(
                        YedeklemeTetiklemeTipi.Otomatik,
                        "Sistem");

                if (sonuc.Success)
                {
                    _logger.LogInformation(
                        "Otomatik yedekleme başarıyla tamamlandı.");
                }
                else
                {
                    _logger.LogWarning(
                        "Otomatik yedekleme tamamlanamadı: {Mesaj}",
                        sonuc.Message);
                }
            }
            catch (OperationCanceledException)
            {
                // Uygulama kapanıyor.
            }
            catch (Exception ex)
            {
                // BackgroundService çökmemeli.
                // Bir sonraki kontrolde tekrar deneyecek.
                _logger.LogError(
                    ex,
                    "Otomatik yedekleme kontrolünde hata oluştu.");
            }
        }
    }
}