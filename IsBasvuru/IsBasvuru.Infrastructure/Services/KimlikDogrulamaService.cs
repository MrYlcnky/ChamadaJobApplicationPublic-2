using IsBasvuru.Domain.DTOs.KimlikDogrulamaDtos;
using IsBasvuru.Domain.Entities.KimlikDogrulama;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Infrastructure.Tools;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class KimlikDogrulamaService : IKimlikDogrulamaService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMailService _mailService;
        private readonly JwtHelper _jwtHelper;

        public KimlikDogrulamaService(IsBasvuruContext context, IMailService mailService, IConfiguration configuration)
        {
            _context = context;
            _mailService = mailService;
            _jwtHelper = new JwtHelper(configuration);
        }

        public async Task<ServiceResponse<bool>> KodGonderAsync(KodGonderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Eposta))
            {
                return ServiceResponse<bool>.FailureResult(
                    "E-posta adresi zorunludur."
                );
            }

            var eposta = dto.Eposta .Trim() .ToLowerInvariant();

            const string guvenliMesaj =
                "Eğer bu e-posta adresine ait bir başvuru bulunuyorsa doğrulama kodu gönderilecektir.";

            // Kayıtlı kullanıcı kontrolü
            if (dto.KayitliKullaniciKontrolu)
            {
                bool basvuruVarMi = await _context.Personeller
                    .AnyAsync(p =>
                        p.KisiselBilgiler != null &&
                        p.KisiselBilgiler.Email != null &&
                        p.KisiselBilgiler.Email.ToLower() == eposta
                    );

                if (!basvuruVarMi)
                {
                    return ServiceResponse<bool>.SuccessResult(
                        true,
                        guvenliMesaj
                    );
                }
            }

            // Aynı e-posta adresine 60 saniye içerisinde
            // tekrar doğrulama kodu gönderilmesini engelle.
            var sonKod = await _context.DogrulamaKodlari
                .AsNoTracking()
                .Where(x => x.Eposta == eposta)
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            if (sonKod != null)
            {
                var kodOlusturmaTarihi =
                    sonKod.GecerlilikTarihi.AddMinutes(-3);

                var tekrarGonderimTarihi =
                    kodOlusturmaTarihi.AddMinutes(1);

                if (tekrarGonderimTarihi > DateTime.Now)
                {
                    var kalanSaniye = (int)Math.Ceiling(
                        (tekrarGonderimTarihi - DateTime.Now).TotalSeconds
                    );

                    if (dto.KayitliKullaniciKontrolu)
                    {
                        return ServiceResponse<bool>.SuccessResult(
                            true,
                            guvenliMesaj
                        );
                    }

                    return ServiceResponse<bool>.FailureResult(
                        $"Yeni doğrulama kodu istemek için {kalanSaniye} saniye bekleyiniz."
                    );
                }
            }

            // Aynı e-posta adresine ait eski kullanılmamış
            // doğrulama kodlarını geçersiz hale getir.
            var eskiKodlar = await _context.DogrulamaKodlari
                .Where(x =>
                    x.Eposta == eposta &&
                    !x.KullanildiMi
                )
                .ToListAsync();

            if (eskiKodlar.Count > 0)
            {
                foreach (var eskiKod in eskiKodlar)
                {
                    eskiKod.KullanildiMi = true;
                }

                await _context.SaveChangesAsync();
            }

            // Güvenli 6 haneli doğrulama kodu üret.
            int secureNumber =
                RandomNumberGenerator.GetInt32(100000, 1000000);

            string uretilenKod =
                secureNumber.ToString();

            var dogrulamaKaydi = new DogrulamaKodu
            {
                Eposta = eposta,
                Kod = uretilenKod,
                GecerlilikTarihi = DateTime.Now.AddMinutes(3),
                KullanildiMi = false
            };

            await _context.DogrulamaKodlari.AddAsync(
                dogrulamaKaydi
            );

            await _context.SaveChangesAsync();

            try
            {
                await _mailService.DogrulamaKoduGonderAsync(
                    eposta,
                    uretilenKod
                );
            }
            catch (Exception)
            {
                // Kullanıcıya ulaşmayan OTP aktif kalmasın.
                dogrulamaKaydi.KullanildiMi = true;
                await _context.SaveChangesAsync();

                if (dto.KayitliKullaniciKontrolu)
                {
                    return ServiceResponse<bool>.SuccessResult(
                        true,
                        guvenliMesaj
                    );
                }

                return ServiceResponse<bool>.FailureResult(
                    "Doğrulama kodu gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz."
                );
            }

            if (dto.KayitliKullaniciKontrolu)
            {
                return ServiceResponse<bool>.SuccessResult(
                    true,
                    guvenliMesaj
                );
            }

            return ServiceResponse<bool>.SuccessResult(
                true,
                "Doğrulama kodu e-posta adresinize gönderildi."
            );
        }

        public async Task<ServiceResponse<AuthResponseDto>> KodDogrulaAsync(KodDogrulaDto dto)
        {
            var kayit = await _context.DogrulamaKodlari
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync(x => x.Eposta == dto.Eposta && x.Kod == dto.Kod && !x.KullanildiMi);

            if (kayit == null)
                return ServiceResponse<AuthResponseDto>.FailureResult("Geçersiz veya kullanılmış kod.");

            if (kayit.GecerlilikTarihi < DateTime.Now)
                return ServiceResponse<AuthResponseDto>.FailureResult("Kodun süresi dolmuş. Lütfen tekrar kod isteyin.");

            // Kod doğru -> Kullanıldı işaretle
            kayit.KullanildiMi = true;
            await _context.SaveChangesAsync();

            // Token Üret
            string token = _jwtHelper.BasvuruTokenUret(dto.Eposta);

            return ServiceResponse<AuthResponseDto>.SuccessResult(new AuthResponseDto
            {
                Token = token,
                Eposta = dto.Eposta
            }, "Doğrulama başarılı.");
        }
    }
}