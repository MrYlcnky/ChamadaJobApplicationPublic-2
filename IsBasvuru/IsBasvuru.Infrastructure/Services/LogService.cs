using AutoMapper;
using IsBasvuru.Domain.DTOs.LogDtos.BasvuruLogDtos;
using IsBasvuru.Domain.DTOs.LogDtos.CvLogDtos;
using IsBasvuru.Domain.Entities.Log;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class LogService : ILogService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public LogService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // OKUMA

        public async Task<ServiceResponse<List<BasvuruIslemLogListDto>>> GetAllBasvuruLogsAsync()
        {
            var logs = await _context.BasvuruIslemLoglari
                .Include(x => x.PanelKullanici!)
                    .ThenInclude(u => u.Rol)
                .Include(x => x.MasterBasvuru!)
                    .ThenInclude(m => m.Personel!)
                        .ThenInclude(p => p.KisiselBilgiler)
                .Include(x => x.MasterBasvuru!)
                    .ThenInclude(m => m.Personel!)
                        .ThenInclude(p => p.IsBasvuruDetay!)
                            .ThenInclude(d => d.BasvuruSubeler!)
                                .ThenInclude(s => s.Sube)
                .Include(x => x.MasterBasvuru!)
                    .ThenInclude(m => m.Personel!)
                        .ThenInclude(p => p.IsBasvuruDetay!)
                            .ThenInclude(d => d.BasvuruAlanlar!)
                                .ThenInclude(a => a.SubeAlan!)
                                    .ThenInclude(ma => ma.MasterAlan)
                .Include(x => x.MasterBasvuru!)
                    .ThenInclude(m => m.Personel!)
                        .ThenInclude(p => p.IsBasvuruDetay!)
                            .ThenInclude(d => d.BasvuruDepartmanlar!)
                                .ThenInclude(dep => dep.Departman!)
                                    .ThenInclude(md => md.MasterDepartman)
                .Include(x => x.MasterBasvuru!)
                    .ThenInclude(m => m.Personel!)
                        .ThenInclude(p => p.IsBasvuruDetay!)
                            .ThenInclude(d => d.BasvuruPozisyonlar!)
                                .ThenInclude(p => p.DepartmanPozisyon!)
                                    .ThenInclude(mp => mp.MasterPozisyon)
                .OrderByDescending(x => x.IslemTarihi)
                .AsNoTracking() // Listeleme olduğu için performans kazancı sağlar
                .ToListAsync();

            var mappedLogs = _mapper.Map<List<BasvuruIslemLogListDto>>(logs);
            return ServiceResponse<List<BasvuruIslemLogListDto>>.SuccessResult(mappedLogs);
        }
        // Belirli bir başvuruya ait logları getirir (Interface ismiyle eşitlendi)
        public async Task<ServiceResponse<List<BasvuruIslemLogListDto>>> GetBasvuruLogsAsync( int masterBasvuruId, int roleId, int? subeId, int? departmanId, int? alanId)
        {
            try
            {
                // Önce kullanıcının bu başvuruyu görme yetkisi var mı kontrol et.
                var yetkiliBasvuruQuery =
                    _context.MasterBasvurular.AsQueryable();


                // Roller:
                // 1 = SuperAdmin
                // 2 = Admin
                // 3 = IkAdmin
                // 4 = IK
                //
                // Bu roller tüm başvuruları görebilir.
                if (roleId != 1 &&
                    roleId != 2 &&
                    roleId != 3 &&
                    roleId != 4)
                {
                    // ------------------------------------------------
                    // DEPARTMAN MÜDÜRÜ
                    // ------------------------------------------------
                    if (roleId == 6)
                    {
                        // Fail-closed:
                        // Scope bilgisi yoksa tüm kayıtları açmak yerine erişimi reddet.
                        if (!subeId.HasValue ||
                            !departmanId.HasValue)
                        {
                            return ServiceResponse<List<BasvuruIslemLogListDto>>
                                .FailureResult(
                                    "Departman veya şube yetki bilgisi bulunamadı."
                                );
                        }

                        yetkiliBasvuruQuery =
                            yetkiliBasvuruQuery.Where(x =>
                                x.BasvuruSevkleri.Any(s =>
                                    s.SubeId == subeId.Value &&

                                    s.Departman != null &&
                                    s.Departman.MasterDepartmanId ==
                                        departmanId.Value 
                                )
                            );
                    }

                    // ------------------------------------------------
                    // GENEL MÜDÜR
                    // ------------------------------------------------
                    else if (roleId == 5)
                    {
                        if (!subeId.HasValue ||
                            !alanId.HasValue)
                        {
                            return ServiceResponse<List<BasvuruIslemLogListDto>>
                                .FailureResult(
                                    "Şube veya alan yetki bilgisi bulunamadı."
                                );
                        }

                        yetkiliBasvuruQuery =
                            yetkiliBasvuruQuery.Where(x =>
                                x.BasvuruSevkleri.Any(s =>
                                    (
                                        s.SevkDurumu ==
                                            SevkDurumu.Onaylandi ||

                                        s.SevkDurumu ==
                                            SevkDurumu.OnayUstAsamadaIptalEdildi
                                    )
                                    &&
                                    s.SubeId == subeId.Value
                                    &&
                                    s.Departman != null
                                    &&
                                    s.Departman.SubeAlan != null
                                    &&
                                    s.Departman.SubeAlan.MasterAlanId ==
                                        alanId.Value
                                )
                            );
                    }

                    // ------------------------------------------------
                    // MALİ İŞLER MÜDÜRÜ
                    // ------------------------------------------------
                    else if (roleId == 7)
                    {
                        if (!subeId.HasValue)
                        {
                            return ServiceResponse<List<BasvuruIslemLogListDto>>
                                .FailureResult(
                                    "Şube yetki bilgisi bulunamadı."
                                );
                        }

                        yetkiliBasvuruQuery =
                            yetkiliBasvuruQuery.Where(x =>
                                x.BasvuruSevkleri.Any(s =>
                                    (
                                        s.SevkDurumu ==
                                            SevkDurumu.Onaylandi ||

                                        s.SevkDurumu ==
                                            SevkDurumu.OnayUstAsamadaIptalEdildi
                                    )
                                    &&
                                    s.SubeId == subeId.Value
                                )
                            );
                    }

                    // Tanımsız / beklenmeyen rol
                    else
                    {
                        return ServiceResponse<List<BasvuruIslemLogListDto>>
                            .FailureResult(
                                "Bu başvurunun işlem geçmişini görüntüleme yetkiniz bulunmamaktadır."
                            );
                    }
                }


                // Asıl BOLA kontrolü.
                // Kullanıcının scope'u içinde bu başvuru gerçekten var mı?
                var basvuruyaYetkiliMi =
                    await yetkiliBasvuruQuery
                        .AsNoTracking()
                        .AnyAsync(x => x.Id == masterBasvuruId);


                if (!basvuruyaYetkiliMi)
                {
                    return ServiceResponse<List<BasvuruIslemLogListDto>>
                        .FailureResult(
                            "Başvuru bulunamadı veya bu başvurunun işlem geçmişini görüntüleme yetkiniz yok."
                        );
                }


                // Yetki doğrulandıktan sonra logları getir.
                var logs = await _context.BasvuruIslemLoglari

                    .Include(x => x.PanelKullanici)
                        .ThenInclude(u => u!.Rol)

                    .Include(x => x.MasterBasvuru)
                        .ThenInclude(m => m!.Personel)
                            .ThenInclude(p => p!.KisiselBilgiler)

                    .Include(x => x.MasterBasvuru)
                        .ThenInclude(m => m!.Personel)
                            .ThenInclude(p => p!.IsBasvuruDetay)
                                .ThenInclude(d => d!.BasvuruSubeler)
                                    .ThenInclude(s => s.Sube)

                    .Include(x => x.MasterBasvuru)
                        .ThenInclude(m => m!.Personel)
                            .ThenInclude(p => p!.IsBasvuruDetay)
                                .ThenInclude(d => d!.BasvuruAlanlar)
                                    .ThenInclude(a => a.SubeAlan)
                                        .ThenInclude(ma => ma!.MasterAlan)

                    .Include(x => x.MasterBasvuru)
                        .ThenInclude(m => m!.Personel)
                            .ThenInclude(p => p!.IsBasvuruDetay)
                                .ThenInclude(d => d!.BasvuruDepartmanlar)
                                    .ThenInclude(dep => dep.Departman)
                                        .ThenInclude(md => md!.MasterDepartman)

                    .Include(x => x.MasterBasvuru)
                        .ThenInclude(m => m!.Personel)
                            .ThenInclude(p => p!.IsBasvuruDetay)
                                .ThenInclude(d => d!.BasvuruPozisyonlar)
                                    .ThenInclude(poz => poz.DepartmanPozisyon)
                                        .ThenInclude(mp => mp!.MasterPozisyon)

                    .Where(x =>
                        x.MasterBasvuruId == masterBasvuruId
                    )

                    .OrderByDescending(x => x.IslemTarihi)

                    .AsNoTracking()

                    .ToListAsync();


                var mappedLogs =
                    _mapper.Map<List<BasvuruIslemLogListDto>>(logs);


                return ServiceResponse<List<BasvuruIslemLogListDto>>
                    .SuccessResult(mappedLogs);
            }
            catch (Exception ex)
            {
                return ServiceResponse<List<BasvuruIslemLogListDto>>
                    .FailureResult(
                        $"İşlem geçmişi yüklenirken hata"
                    );
            }
        }

        public async Task<ServiceResponse<List<CvDegisiklikLogListDto>>> GetCvLogsAsync( int personelId, int roleId, int? subeId, int? departmanId, int? alanId)
        {
            try
            {
                var yetkiliBasvuruQuery =
                    _context.MasterBasvurular.AsQueryable();


                // ----------------------------------------------------
                // DEPARTMAN MÜDÜRÜ
                // ----------------------------------------------------
                if (roleId == 6)
                {
                    if (!subeId.HasValue ||
                        !departmanId.HasValue)
                    {
                        return ServiceResponse<List<CvDegisiklikLogListDto>>
                            .FailureResult(
                                "Şube veya departman yetki bilgisi bulunamadı."
                            );
                    }

                    yetkiliBasvuruQuery =
                        yetkiliBasvuruQuery.Where(x =>
                            x.BasvuruSevkleri.Any(s =>

                                s.SubeId == subeId.Value &&

                                s.Departman != null &&

                                s.Departman.MasterDepartmanId ==
                                    departmanId.Value &&

                                (
                                    !alanId.HasValue ||

                                    (
                                        s.Departman.SubeAlan != null &&
                                        s.Departman.SubeAlan.MasterAlanId ==
                                            alanId.Value
                                    )
                                )
                            )
                        );
                }


                // ----------------------------------------------------
                // GENEL MÜDÜR
                // ----------------------------------------------------
                else if (roleId == 5)
                {
                    if (!subeId.HasValue ||
                        !alanId.HasValue)
                    {
                        return ServiceResponse<List<CvDegisiklikLogListDto>>
                            .FailureResult(
                                "Şube veya alan yetki bilgisi bulunamadı."
                            );
                    }

                    yetkiliBasvuruQuery =
                        yetkiliBasvuruQuery.Where(x =>
                            x.BasvuruSevkleri.Any(s =>
                                (
                                    s.SevkDurumu ==
                                        SevkDurumu.Onaylandi ||

                                    s.SevkDurumu ==
                                        SevkDurumu.OnayUstAsamadaIptalEdildi
                                )
                                &&
                                s.SubeId == subeId.Value
                                &&
                                s.Departman != null
                                &&
                                s.Departman.SubeAlan != null
                                &&
                                s.Departman.SubeAlan.MasterAlanId ==
                                    alanId.Value
                            )
                        );
                }


                // ----------------------------------------------------
                // MALİ İŞLER MÜDÜRÜ
                // ----------------------------------------------------
                else if (roleId == 7)
                {
                    if (!subeId.HasValue)
                    {
                        return ServiceResponse<List<CvDegisiklikLogListDto>>
                            .FailureResult(
                                "Şube yetki bilgisi bulunamadı."
                            );
                    }

                    yetkiliBasvuruQuery =
                        yetkiliBasvuruQuery.Where(x =>
                            x.BasvuruSevkleri.Any(s =>
                                (
                                    s.SevkDurumu ==
                                        SevkDurumu.Onaylandi ||

                                    s.SevkDurumu ==
                                        SevkDurumu.OnayUstAsamadaIptalEdildi
                                )
                                &&
                                s.SubeId == subeId.Value
                            )
                        );
                }


                // ----------------------------------------------------
                // İK / ADMIN GRUBU
                // ----------------------------------------------------
                else if (
                    roleId != 1 &&
                    roleId != 2 &&
                    roleId != 3 &&
                    roleId != 4
                )
                {
                    return ServiceResponse<List<CvDegisiklikLogListDto>>
                        .FailureResult(
                            "CV değişiklik geçmişini görüntüleme yetkiniz bulunmamaktadır."
                        );
                }


                // ----------------------------------------------------
                // BOLA KONTROLÜ
                // ----------------------------------------------------
                var personeleYetkiliMi =
                    await yetkiliBasvuruQuery
                        .AsNoTracking()
                        .AnyAsync(x =>
                            x.PersonelId == personelId
                        );


                if (!personeleYetkiliMi)
                {
                    return ServiceResponse<List<CvDegisiklikLogListDto>>
                        .FailureResult(
                            "Personel bulunamadı veya bu personelin CV geçmişini görüntüleme yetkiniz yok."
                        );
                }


                // ----------------------------------------------------
                // YETKİ GEÇTİ → LOGLARI GETİR
                // ----------------------------------------------------
                var logs = await _context.CvDegisiklikLoglari
                    .Where(x =>
                        x.PersonelId == personelId
                    )
                    .OrderByDescending(x =>
                        x.DegisiklikTarihi
                    )
                    .AsNoTracking()
                    .ToListAsync();


                var mappedLogs =
                    _mapper.Map<List<CvDegisiklikLogListDto>>(logs);


                return ServiceResponse<List<CvDegisiklikLogListDto>>
                    .SuccessResult(mappedLogs);
            }
            catch (Exception ex)
            {
                return ServiceResponse<List<CvDegisiklikLogListDto>>
                    .FailureResult(
                        $"CV değişiklik geçmişi yüklenirken hata oluştu"
                    );
            }
        }

        // YAZMA

        public async Task<ServiceResponse<bool>> LogBasvuruIslemAsync(int masterBasvuruId, int? panelKullaniciId, LogIslemTipi islemTipi, string islemAciklama, int? rolId = null,
    BasvuruDurum? basvuruDurum = null,
    BasvuruOnayAsamasi? basvuruOnayAsamasi = null)
        {
            var log = new BasvuruIslemLog
            {
                MasterBasvuruId = masterBasvuruId,
                PanelKullaniciId = panelKullaniciId,
                IslemTipi = islemTipi,
                IslemAciklama = islemAciklama,
                IslemTarihi = DateTime.Now,
                RolId = rolId,
                BasvuruDurum = basvuruDurum,
                BasvuruOnayAsamasi = basvuruOnayAsamasi

            };

            await _context.BasvuruIslemLoglari.AddAsync(log);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> LogCvDegisiklikAsync(int masterBasvuruId, int personelId, int degisenKayitId, string degisenTabloAdi, string? degisenAlanAdi, string? eskiDeger, string? yeniDeger, LogIslemTipi degisiklikTipi)
        {
            // Değer değişmemişse loglama yapma
            if (eskiDeger == yeniDeger)
                return ServiceResponse<bool>.SuccessResult(true);

            // --- ID'LERİ İSİMLERE ÇEVİR (TRANSLATION) ---
            string temizEskiDeger = await TranslateIdToNameAsync(degisenAlanAdi, eskiDeger);
            string temizYeniDeger = await TranslateIdToNameAsync(degisenAlanAdi, yeniDeger);

            // Frontend'de İngilizce/Teknik alan isimleri yerine temiz Türkçe isimler görünmesi için:
            string gosterimAlanAdi = (degisenAlanAdi ?? "") switch
            {
                "DepartmanPozisyonId" => "Başvurulan Pozisyon",
                "DepartmanId" => "Başvurulan Departman",
                "SubeId" => "Başvurulan Şube",
                "SubeAlanId" => "Başvurulan Alan",
                "VesikalikFotograf" => "Vesikalık Fotoğraf",
                "NedenBiz" => "Bizi Neden Seçtiniz",
                _ => degisenAlanAdi ?? "Bilinmeyen Alan"
            };
            // ---------------------------------------------

            var log = new CvDegisiklikLog
            {
                MasterBasvuruId = masterBasvuruId,
                PersonelId = personelId,
                DegisenKayitId = degisenKayitId,
                DegisenTabloAdi = degisenTabloAdi,
                DegisenAlanAdi = gosterimAlanAdi,
                EskiDeger = temizEskiDeger,
                YeniDeger = temizYeniDeger,
                DegisiklikTipi = degisiklikTipi,
                DegisiklikTarihi = DateTime.Now
            };

            await _context.CvDegisiklikLoglari.AddAsync(log);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }


        // ID'leri İsimlere ve Tam Yollara (Hierarchy) Çeviren Yardımcı Metot
        private async Task<string> TranslateIdToNameAsync(string? alanAdi, string? deger)
        {
            // Değer null ise veya boşsa direkt geri dön
            if (string.IsNullOrWhiteSpace(deger) || deger == "-") return deger ?? "-";
            if (string.IsNullOrWhiteSpace(alanAdi)) return deger;

            try
            {
                switch (alanAdi)
                {
                    case "DepartmanPozisyonId":
                        if (int.TryParse(deger, out int pozId))
                        {
                            // ! işareti (null-forgiving) ile EF Core uyarısını susturuyoruz
                            var pozisyon = await _context.DepartmanPozisyonlar
                                .Include(p => p.MasterPozisyon!)
                                .Include(p => p.Departman!)
                                    .ThenInclude(d => d.MasterDepartman!)
                                .Include(p => p.Departman!)
                                    .ThenInclude(d => d.SubeAlan!)
                                        .ThenInclude(sa => sa.MasterAlan!)
                                .Include(p => p.Departman!)
                                    .ThenInclude(d => d.SubeAlan!)
                                        .ThenInclude(sa => sa.Sube!)
                                .FirstOrDefaultAsync(x => x.Id == pozId);

                            if (pozisyon != null)
                            {
                                string subeAdi = pozisyon.Departman?.SubeAlan?.Sube?.SubeAdi ?? "Şube Yok";
                                string departmanAdi = pozisyon.Departman?.MasterDepartman?.MasterDepartmanAdi ?? "Departman Yok";
                                string pozisyonAdi = pozisyon.MasterPozisyon?.MasterPozisyonAdi ?? "Pozisyon Yok";

                                return $"{subeAdi} > {departmanAdi} > {pozisyonAdi}";
                            }
                        }
                        break;

                    case "DepartmanId":
                        if (int.TryParse(deger, out int depId))
                        {
                            var departman = await _context.Departmanlar
                                .Include(d => d.MasterDepartman!)
                                .Include(d => d.SubeAlan!)
                                    .ThenInclude(sa => sa.MasterAlan!)
                                .Include(d => d.SubeAlan!)
                                    .ThenInclude(sa => sa.Sube!)
                                .FirstOrDefaultAsync(x => x.Id == depId);

                            if (departman != null)
                            {
                                string subeAdi = departman.SubeAlan?.Sube?.SubeAdi ?? "Şube Yok";
                                string departmanAdi = departman.MasterDepartman?.MasterDepartmanAdi ?? "Departman Yok";

                                return $"{subeAdi} > {departmanAdi}";
                            }
                        }
                        break;

                    case "SubeAlanId":
                        if (int.TryParse(deger, out int alanId))
                        {
                            var alan = await _context.SubeAlanlar
                                .Include(sa => sa.MasterAlan!)
                                .Include(sa => sa.Sube!)
                                .FirstOrDefaultAsync(x => x.Id == alanId);

                            if (alan != null)
                            {
                                string subeAdi = alan.Sube?.SubeAdi ?? "Şube Yok";
                                string alanAdiEki = alan.MasterAlan?.MasterAlanAdi ?? "Alan Yok";
                                return $"{subeAdi} > {alanAdiEki}";
                            }
                        }
                        break;

                    case "SubeId":
                        if (int.TryParse(deger, out int subeId))
                        {
                            var sube = await _context.Subeler.FirstOrDefaultAsync(x => x.Id == subeId);
                            return sube?.SubeAdi ?? deger;
                        }
                        break;

                    case "VesikalikFotograf":
                        return "Fotoğraf Değiştirildi";

                    case "NedenBiz":
                        return deger.Length > 50 ? deger.Substring(0, 50) + "..." : deger;
                }
            }
            // "ex" kullanılmıyor uyarısını önlemek için sadece Exception yazıyoruz
            catch (Exception)
            {
                // Sistemi çökertmemek için hatayı yut, orijinal sayıyı (ID'yi) göster
            }

            return deger;
        }
    }
}