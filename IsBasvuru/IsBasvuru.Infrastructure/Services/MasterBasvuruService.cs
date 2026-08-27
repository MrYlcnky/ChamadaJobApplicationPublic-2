using AutoMapper;
using IsBasvuru.Domain.DTOs.BasvuruSevkDtos;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Entities.Log;
using IsBasvuru.Domain.Entities.SirketYapisi.GorevAtama;
using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
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
    public class MasterBasvuruService : IMasterBasvuruService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogService _logService;
        private readonly IImageService _imageService;
        private readonly IMailService _mailService;
        private const int SUPER_ADMIN_ROLE_ID = 1;

        public MasterBasvuruService(IsBasvuruContext context, IMapper mapper, ICurrentUserService currentUserService, ILogService logService, IImageService imageService, IMailService mailService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _logService = logService;
            _imageService = imageService;
            _mailService = mailService;
        }

        public async Task<ServiceResponse<List<MasterBasvuruListDto>>> GetAllAsync(int roleId, int? subeId, int? departmanId, int? alanId)
        {
            var query = _context.MasterBasvurular.AsQueryable();

            //  SÜPER ADMİN BYPASS: Rol 1 ise hiçbir WHERE filtresine girmeden tümünü çeker.
            if (roleId != SUPER_ADMIN_ROLE_ID)
            {
                // Departman Müdürü
                if (roleId == 6)
                {
                    if (!subeId.HasValue || !departmanId.HasValue)
                    {
                        return ServiceResponse<List<MasterBasvuruListDto>>.FailureResult(
                            "Başvuruları görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    var yetkiliBasvuruIdleri = await _context.BasvuruSevkleri
                        .Where(s =>
                            s.SubeId == subeId.Value &&
                            s.Departman != null &&
                            s.Departman.MasterDepartmanId == departmanId.Value &&
                            s.SevkDurumu != SevkDurumu.BaskaDepartmanOnayladi)
                        .Select(s => s.MasterBasvuruId)
                        .Distinct()
                        .ToListAsync();

                    query = query.Where(x => yetkiliBasvuruIdleri.Contains(x.Id));
                }

                // Genel Müdür
                else if (roleId == 5)
                {
                    if (!subeId.HasValue || !alanId.HasValue)
                    {
                        return ServiceResponse<List<MasterBasvuruListDto>>.FailureResult(
                            "Başvuruları görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query
                        .Where(x =>
                            x.BasvuruSevkleri.Any(s =>
                                (
                                    s.SevkDurumu == SevkDurumu.Onaylandi ||
                                    s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                                ) &&
                                s.SubeId == subeId.Value &&
                                s.Departman != null &&
                                s.Departman.SubeAlan != null &&
                                s.Departman.SubeAlan.MasterAlanId == alanId.Value
                            )
                        )
                        .Where(x =>
                            x.BasvuruOnayAsamasi >= BasvuruOnayAsamasi.Genel_Mudur_Onayi ||
                            x.BasvuruDurum == BasvuruDurum.Reddedildi ||
                            x.BasvuruDurum == BasvuruDurum.RevizeTalebi
                        );
                }

                // Mali İşler Müdürü
                else if (roleId == 7)
                {
                    if (!subeId.HasValue)
                    {
                        return ServiceResponse<List<MasterBasvuruListDto>>.FailureResult(
                            "Başvuruları görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query
                        .Where(x =>
                            x.BasvuruSevkleri.Any(s =>
                                (
                                    s.SevkDurumu == SevkDurumu.Onaylandi ||
                                    s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                                ) &&
                                s.SubeId == subeId.Value
                            )
                        )
                        .Where(x =>
                            x.BasvuruOnayAsamasi >= BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi ||
                            x.BasvuruDurum == BasvuruDurum.Reddedildi ||
                            x.BasvuruDurum == BasvuruDurum.RevizeTalebi
                        );
                }

                // Admin tüm şubeleri görebilir.
                else if (roleId == 2)
                {
                    // Ek scope filtresi yok.
                }

                // IkAdmin / IK
                else if (roleId == 3 || roleId == 4)
                {
                    // Kullanıcı belirli bir şubeye bağlıysa,
                    // aday o şubeyi tercihlerinde seçmiş olmalıdır.
                    // SubeId null ise tüm şubelerde çalışabilir.
                    if (subeId.HasValue)
                    {
                        query = query.Where(x =>
                            x.Personel != null &&
                            x.Personel.IsBasvuruDetay != null &&
                            x.Personel.IsBasvuruDetay.BasvuruSubeler.Any(bs =>
                                bs.SubeId == subeId.Value
                            )
                        );
                    }
                }

                // Tanımsız herhangi bir rol
                else
                {
                    return ServiceResponse<List<MasterBasvuruListDto>>.FailureResult(
                        "Başvuruları görüntüleme yetkiniz bulunmamaktadır.");
                }
            }

            var list = await query
                .Include(x => x.BasvuruIslemLoglari).ThenInclude(l => l.PanelKullanici).ThenInclude(u => u!.Rol)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.KisiselBilgiler)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.DigerKisiselBilgiler!)
                        .ThenInclude(d => d.KktcBelge)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.EgitimBilgileri)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsDeneyimleri)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.YabanciDilBilgileri!)
                    .ThenInclude(y => y.Dil)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.BilgisayarBilgileri)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.SertifikaBilgileri)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.ReferansBilgileri)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.PersonelEhliyetler!)
                        .ThenInclude(e => e.EhliyetTuru)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                        .ThenInclude(d => d.BasvuruSubeler!).ThenInclude(s => s.Sube)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                        .ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.MasterAlan)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                        .ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dep => dep.Departman!).ThenInclude(md => md.MasterDepartman)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                        .ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(poz => poz.DepartmanPozisyon!).ThenInclude(mp => mp.MasterPozisyon)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                    .ThenInclude(d => d.BasvuruOyunlar!).ThenInclude(pro => pro.OyunBilgileri!).ThenInclude(mp => mp.MasterOyun)
                .Include(x => x.Personel!)
                    .ThenInclude(p => p.IsBasvuruDetay!)
                    .ThenInclude(d => d.BasvuruProgramlar!).ThenInclude(bp => bp.ProgramBilgisi!).ThenInclude(mp => mp.MasterProgram)
                .Include(m => m.BasvuruSevkleri)
                    .ThenInclude(s => s.Sube)
                .Include(m => m.BasvuruSevkleri)
                    .ThenInclude(s => s.Departman!)
                    .ThenInclude(d => d.MasterDepartman)
                .Include(m => m.BasvuruSevkleri)
                    .ThenInclude(s => s.Departman!)
                    .ThenInclude(d => d.SubeAlan!)
                    .ThenInclude(sa => sa.MasterAlan)
                .OrderByDescending(x => x.BasvuruTarihi)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();

            var mappedList = _mapper.Map<List<MasterBasvuruListDto>>(list);

            var personelIdleri = mappedList.Select(x => x.PersonelId).ToList();
            if (personelIdleri.Any())
            {
                var atamaTarihleri = await _context.Set<GorevAtamaDetay>()
                    .Where(g => personelIdleri.Contains(g.PersonelId))
                    .ToDictionaryAsync(g => g.PersonelId, g => g.BaslangicTarihi);

                foreach (var item in mappedList)
                {
                    if (atamaTarihleri.TryGetValue(item.PersonelId, out var tarih))
                    {
                        item.IseBaslamaTarihi = tarih;
                    }
                }
            }

            return ServiceResponse<List<MasterBasvuruListDto>>.SuccessResult(mappedList);
        }

        public async Task<ServiceResponse<MasterBasvuruListDto>> GetByIdAsync(int id, int roleId, int? subeId, int? departmanId, int? alanId)
        {
            var query = _context.MasterBasvurular.AsQueryable();

            //  SÜPER ADMİN BYPASS: Rol 1 ise filtreleri geç, doğrudan getir.
            if (roleId != SUPER_ADMIN_ROLE_ID)
            {
                if (roleId == 6)
                {
                    if (!subeId.HasValue || !departmanId.HasValue)
                    {
                        return ServiceResponse<MasterBasvuruListDto>.FailureResult(
                            "Başvuruyu görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            s.SubeId == subeId.Value &&
                            s.Departman != null &&
                            s.Departman.MasterDepartmanId == departmanId.Value &&
                            s.SevkDurumu != SevkDurumu.BaskaDepartmanOnayladi
                        )
                    );
                }
                else if (roleId == 5)
                {
                    if (!subeId.HasValue || !alanId.HasValue)
                    {
                        return ServiceResponse<MasterBasvuruListDto>.FailureResult(
                            "Başvuruyu görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            (
                                s.SevkDurumu == SevkDurumu.Onaylandi ||
                                s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                            ) &&
                            s.SubeId == subeId.Value &&
                            s.Departman != null &&
                            s.Departman.SubeAlan != null &&
                            s.Departman.SubeAlan.MasterAlanId == alanId.Value
                        )
                    );
                }
                else if (roleId == 7)
                {
                    if (!subeId.HasValue)
                    {
                        return ServiceResponse<MasterBasvuruListDto>.FailureResult(
                            "Başvuruyu görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            (
                                s.SevkDurumu == SevkDurumu.Onaylandi ||
                                s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                            ) &&
                            s.SubeId == subeId.Value
                        )
                    );
                }
                // Admin tüm şubelerdeki başvuruları görebilir.
                else if (roleId == 2)
                {
                    // Ek scope filtresi yok.
                }

                // IkAdmin / IK
                else if (roleId == 3 || roleId == 4)
                {
                    // Kullanıcı bir şubeye bağlıysa,
                    // adayın tercihlerinde o şube bulunmalıdır.
                    // SubeId null ise tüm şubelerde çalışabilir.
                    if (subeId.HasValue)
                    {
                        query = query.Where(x =>
                            x.Personel != null &&
                            x.Personel.IsBasvuruDetay != null &&
                            x.Personel.IsBasvuruDetay.BasvuruSubeler.Any(bs =>
                                bs.SubeId == subeId.Value
                            )
                        );
                    }
                }

                // Tanımsız rol
                else
                {
                    return ServiceResponse<MasterBasvuruListDto>.FailureResult(
                        "Başvuruyu görüntüleme yetkiniz bulunmamaktadır.");
                }
            }

            var entity = await query
                 .Include(x => x.BasvuruIslemLoglari)
                     .ThenInclude(l => l.PanelKullanici)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.KisiselBilgiler)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.DigerKisiselBilgiler)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.EgitimBilgileri)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsDeneyimleri)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.YabanciDilBilgileri!)
                     .ThenInclude(y => y.Dil)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.BilgisayarBilgileri)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.SertifikaBilgileri)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.ReferansBilgileri)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.PersonelEhliyetler!)
                         .ThenInclude(e => e.EhliyetTuru)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                         .ThenInclude(d => d.BasvuruSubeler!).ThenInclude(s => s.Sube)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                         .ThenInclude(d => d.BasvuruAlanlar!).ThenInclude(a => a.SubeAlan!).ThenInclude(sa => sa.MasterAlan)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                         .ThenInclude(d => d.BasvuruDepartmanlar!).ThenInclude(dep => dep.Departman!).ThenInclude(md => md.MasterDepartman)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                         .ThenInclude(d => d.BasvuruPozisyonlar!).ThenInclude(poz => poz.DepartmanPozisyon!).ThenInclude(mp => mp.MasterPozisyon)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                     .ThenInclude(d => d.BasvuruOyunlar!).ThenInclude(pro => pro.OyunBilgileri!).ThenInclude(mp => mp.MasterOyun)
                 .Include(x => x.Personel!)
                     .ThenInclude(p => p.IsBasvuruDetay!)
                     .ThenInclude(d => d.BasvuruProgramlar!).ThenInclude(bp => bp.ProgramBilgisi!).ThenInclude(mp => mp.MasterProgram)
                 .Include(m => m.BasvuruSevkleri)
                     .ThenInclude(s => s.Sube)
                 .Include(m => m.BasvuruSevkleri)
                     .ThenInclude(s => s.Departman!)
                     .ThenInclude(d => d.MasterDepartman)
                 .Include(m => m.BasvuruSevkleri)
                     .ThenInclude(s => s.Departman!)
                     .ThenInclude(d => d.SubeAlan!)
                     .ThenInclude(sa => sa.MasterAlan)
                 .AsNoTracking()
                 .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<MasterBasvuruListDto>.FailureResult("Başvuru kaydı bulunamadı veya bu kaydı görüntüleme yetkiniz yok.");

            var mapped = _mapper.Map<MasterBasvuruListDto>(entity);

            var atama = await _context.Set<GorevAtamaDetay>().FirstOrDefaultAsync(g => g.PersonelId == mapped.PersonelId);
            if (atama != null)
            {
                mapped.IseBaslamaTarihi = atama.BaslangicTarihi;
            }

            return ServiceResponse<MasterBasvuruListDto>.SuccessResult(mapped);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(MasterBasvuruUpdateDto dto)
        {
            var entity = await _context.MasterBasvurular
             .Include(x => x.Personel)
                 .ThenInclude(p => p!.KisiselBilgiler)
             .Include(x => x.BasvuruIslemLoglari)
             .Include(x => x.BasvuruSevkleri)
                 .ThenInclude(s => s.Departman)
                     .ThenInclude(d => d.SubeAlan)
             .FirstOrDefaultAsync(x => x.Id == dto.Id);

            

            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Güncellenecek başvuru bulunamadı.");

            var basvuruyuSonlandir =
                dto.IslemAksiyonu ==
                BasvuruIslemAksiyonu.SonlandirVeRedMailiGonder;

            var kaldigiYerdenDevamEttir =
                dto.IslemAksiyonu ==
                BasvuruIslemAksiyonu.KaldigiYerdenDevamEttir;

            var ilkAsamayaDondur =
                dto.IslemAksiyonu ==
                BasvuruIslemAksiyonu.IlkAsamayaDondur;

            var basvuruyuYenidenAc =
                kaldigiYerdenDevamEttir || ilkAsamayaDondur;

            int[] ikGrubuYetkiliRolleri = { 1, 2, 3, 4 };

            var ikGrubuYetkiliMi = _currentUserService.RolId.HasValue && ikGrubuYetkiliRolleri.Contains( _currentUserService.RolId.Value );



            // Tamamen reddetme işlemini yalnızca İK grubu yapabilir.
            if (basvuruyuSonlandir && !ikGrubuYetkiliMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Başvuruyu tamamen reddetme ve red maili gönderme yetkiniz bulunmamaktadır."
                );
            }

            // Yeniden açma işlemlerini yalnızca İK grubu yapabilir.
            if (basvuruyuYenidenAc && !ikGrubuYetkiliMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Tamamen reddedilmiş başvuruyu yeniden açma yetkiniz bulunmamaktadır."
                );
            }

            // Tamamen reddedilmemiş bir başvuruda yeniden açma işlemi yapılamaz.
            if (basvuruyuYenidenAc && !entity.TamamenReddedildiMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru tamamen reddedilmiş durumda değildir."
                );
            }

            // Tamamen reddedilmiş başvuruda yalnızca:
            // - yeniden tamamen reddetme,
            // - kaldığı yerden devam,
            // - ilk aşamaya döndürme
            // işlemleri yapılabilir.
            if (entity.TamamenReddedildiMi && !basvuruyuSonlandir && !basvuruyuYenidenAc)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru tamamen reddedilmiş ve süreç kilitlenmiştir. Yalnızca İK grubu tarafından yeniden açılabilir."
                );
            }

            var oncekiBasvuruDurumu = entity.BasvuruDurum;
            var oncekiBasvuruOnayAsamasi = entity.BasvuruOnayAsamasi;

            bool isProcessUpdate =!basvuruyuSonlandir &&!basvuruyuYenidenAc &&(dto.BasvuruOnayAsamasi != 0 || dto.BasvuruDurum != 0 );

            // NORMAL SÜREÇ İŞLEMİ YETKİ KONTROLÜ
            // Revize talebi ayrı bir işlem olduğu için bu kontrolden hariç tutulur.

            var standartRevizeTalebiMi = dto.IslemAksiyonu == BasvuruIslemAksiyonu.StandartIslem && dto.BasvuruDurum == BasvuruDurum.RevizeTalebi;


            // Mevcut başvuru zaten revize bekliyorsa ve
            // kabul/red kararı gönderiliyorsa bu revize kararıdır.
            var revizeKarariMi =
                entity.BasvuruDurum == BasvuruDurum.RevizeTalebi &&
                dto.IslemAksiyonu == BasvuruIslemAksiyonu.StandartIslem &&
                ( dto.BasvuruDurum == BasvuruDurum.DevamEdiyor || dto.BasvuruDurum == BasvuruDurum.Reddedildi );


            // ----------------------------------------------------
            // 1) NORMAL SÜREÇ İŞLEMİ YETKİ KONTROLÜ
            // ----------------------------------------------------
            if (isProcessUpdate &&
                !standartRevizeTalebiMi &&
                !revizeKarariMi &&
                _currentUserService.RolId != SUPER_ADMIN_ROLE_ID)
            {
                var normalIslemRolId = _currentUserService.RolId;

                int[] ikRolleri = { 2, 3, 4 };

                var normalIslemYetkiliMi =
                    // İK: ilk değerlendirme ve son kontrol
                    (
                        ikRolleri.Contains(normalIslemRolId ?? 0) &&
                        (
                            entity.BasvuruOnayAsamasi ==
                                BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme ||

                            entity.BasvuruOnayAsamasi ==
                                BasvuruOnayAsamasi.Ik_Son_Kontrol
                        )
                    )

                    ||

                    // Genel Müdür
                    (
                        normalIslemRolId == 5 &&
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Genel_Mudur_Onayi
                    )

                    ||

                    // Mali İşler Müdürü
                    (
                        normalIslemRolId == 7 &&
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi
                    );

                if (!normalIslemYetkiliMi)
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Bu başvurunun mevcut aşamasında işlem yapma yetkiniz bulunmamaktadır."
                    );
                }
            }


            // ----------------------------------------------------
            // 2) REVİZE KARARI YETKİ KONTROLÜ
            // ----------------------------------------------------
            // Revize talebini yalnızca İK grubu onaylayabilir/reddedebilir.
            if (revizeKarariMi && !ikGrubuYetkiliMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Revize talebini onaylama veya reddetme yetkiniz bulunmamaktadır."
                );
            }


            // ----------------------------------------------------
            // 3) REVİZE TALEBİ OLUŞTURMA YETKİ KONTROLÜ
            // ----------------------------------------------------
            if (standartRevizeTalebiMi && _currentUserService.RolId != SUPER_ADMIN_ROLE_ID)
            {
                var revizeRolId = _currentUserService.RolId;

                // Kullanıcı bu başvuruda daha önce gerçekten işlem yaptı mı?
                var dahaOnceKararVerdiMi =
                    entity.BasvuruIslemLoglari.Any(l =>
                        l.PanelKullaniciId == _currentUserService.UserId &&
                        (
                            l.IslemTipi == LogIslemTipi.Onay ||
                            l.IslemTipi == LogIslemTipi.Red ||
                            l.IslemTipi == LogIslemTipi.Sevk
                        )
                    );


                // İK
                var ikRevizeYetkiliMi =
                    (
                        revizeRolId == 2 ||
                        revizeRolId == 3 ||
                        revizeRolId == 4
                    )
                    &&
                    (
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Departman_Onayi ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Ik_Son_Kontrol ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Genel_Mudur_Onayi ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi ||

                        entity.BasvuruDurum ==
                            BasvuruDurum.Reddedildi ||

                        dahaOnceKararVerdiMi
                    );


                var departmanKendiSevkindeKararVermisMi = false;

                if (revizeRolId == 6)
                {
                    var departmanKullanicisi = await _context.PanelKullanicilari
                        .FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId);

                    if (departmanKullanicisi != null &&
                        departmanKullanicisi.SubeId.HasValue &&
                        departmanKullanicisi.MasterDepartmanId.HasValue)
                    {
                        departmanKendiSevkindeKararVermisMi =
                            entity.BasvuruSevkleri.Any(s =>
                                s.SubeId == departmanKullanicisi.SubeId.Value &&

                                s.Departman != null &&
                                s.Departman.MasterDepartmanId ==
                                    departmanKullanicisi.MasterDepartmanId.Value &&

                                (
                                    !departmanKullanicisi.MasterAlanId.HasValue ||
                                    (
                                        s.Departman.SubeAlan != null &&
                                        s.Departman.SubeAlan.MasterAlanId ==
                                            departmanKullanicisi.MasterAlanId.Value
                                    )
                                ) &&

                                (
                                    s.SevkDurumu == SevkDurumu.Onaylandi ||
                                    s.SevkDurumu == SevkDurumu.Reddedildi ||
                                    s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                                )
                            );
                    }
                }


                // Departman Müdürü
                var departmanRevizeYetkiliMi = revizeRolId == 6 && departmanKendiSevkindeKararVermisMi && (
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Departman_Onayi ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Ik_Son_Kontrol ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Genel_Mudur_Onayi ||

                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi ||

                        entity.BasvuruDurum ==
                            BasvuruDurum.Reddedildi
                    );


                // Genel Müdür
                var genelMudurRevizeYetkiliMi =
                    revizeRolId == 5 &&
                    dahaOnceKararVerdiMi &&
                    (
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi ||

                        entity.BasvuruDurum ==
                            BasvuruDurum.Reddedildi
                    );


                // Mali İşler Müdürü
                var maliIslerRevizeYetkiliMi =
                    revizeRolId == 7 &&
                    dahaOnceKararVerdiMi &&
                    (
                        entity.BasvuruDurum ==
                            BasvuruDurum.Onaylandi ||

                        entity.BasvuruDurum ==
                            BasvuruDurum.Reddedildi
                    );


                var revizeTalebiYetkiliMi =
                    ikRevizeYetkiliMi ||
                    departmanRevizeYetkiliMi ||
                    genelMudurRevizeYetkiliMi ||
                    maliIslerRevizeYetkiliMi;


                if (!revizeTalebiYetkiliMi)
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Bu başvuru için revize talebi oluşturma yetkiniz bulunmamaktadır."
                    );
                }
            }


            // ----------------------------------------------------
            // 4) REVİZE DÖNÜŞ AŞAMASINI BACKEND BELİRLER
            // ----------------------------------------------------
            if (standartRevizeTalebiMi)
            {
                var revizeTalepRolId = _currentUserService.RolId;
                var mevcutAsama = entity.BasvuruOnayAsamasi;

                BasvuruOnayAsamasi revizeDonusAsamasi;

                // İK grubu + SuperAdmin
                if (revizeTalepRolId == 1 ||
                    revizeTalepRolId == 2 ||
                    revizeTalepRolId == 3 ||
                    revizeTalepRolId == 4)
                {
                    // Başvuru zaten reddedildiyse,
                    // bulunduğu aşamaya geri dönülür.
                    if (entity.BasvuruDurum == BasvuruDurum.Reddedildi)
                    {
                        revizeDonusAsamasi = mevcutAsama;
                    }
                    // Departman veya İK son kontrolden revize:
                    // İK ilk değerlendirmeye döner.
                    else if (
                        mevcutAsama == BasvuruOnayAsamasi.Departman_Onayi ||
                        mevcutAsama == BasvuruOnayAsamasi.Ik_Son_Kontrol
                    )
                    {
                        revizeDonusAsamasi =
                            BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme;
                    }
                    // GM veya Mali aşamasından revize:
                    // İK son kontrole döner.
                    // GM, Mali veya tamamlanmış başvurudan İK revizesi:
                    // İK son kontrole döner.
                    else if (
                        mevcutAsama == BasvuruOnayAsamasi.Genel_Mudur_Onayi ||
                        mevcutAsama == BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi ||
                        mevcutAsama == BasvuruOnayAsamasi.Tamamlandi
                    )
                    {
                        revizeDonusAsamasi =
                            BasvuruOnayAsamasi.Ik_Son_Kontrol;
                    }
                    else
                    {
                        revizeDonusAsamasi = mevcutAsama;
                    }
                }
                // Departman Müdürü
                else if (revizeTalepRolId == 6)
                {
                    revizeDonusAsamasi =
                        BasvuruOnayAsamasi.Departman_Onayi;
                }
                // Genel Müdür
                else if (revizeTalepRolId == 5)
                {
                    revizeDonusAsamasi =
                        BasvuruOnayAsamasi.Genel_Mudur_Onayi;
                }
                // Mali İşler Müdürü
                else if (revizeTalepRolId == 7)
                {
                    revizeDonusAsamasi =
                        BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi;
                }
                else
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Revize dönüş aşaması belirlenemedi."
                    );
                }

                // Frontend'in gönderdiği aşamaya güvenmiyoruz.
                dto.BasvuruOnayAsamasi = revizeDonusAsamasi;
            }


            // ----------------------------------------------------
            // 5) REVİZE KARARINDA DA AŞAMA DEĞİŞTİRİLEMEZ
            // ----------------------------------------------------
            if (revizeKarariMi)
            {
                // Tamamen reddedilmiş başvurudan oluşturulan revizede
                // hedef RevizeDonusAsamasi alanında tutuluyor.
                // Normal revizede ise mevcut aşama zaten dönüş hedefidir.
                dto.BasvuruOnayAsamasi =
                    entity.RevizeDonusAsamasi ??
                    entity.BasvuruOnayAsamasi;
            }

            // SÜPER ADMİN BYPASS: Onay yapan kişi 1 numaralı Rol ise bu engellemelere HİÇ GİRME.
            if (isProcessUpdate && _currentUserService.RolId != SUPER_ADMIN_ROLE_ID &&
                (entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Son_Kontrol ||
                 entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Genel_Mudur_Onayi ||
                 entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi))
            {
                var currentUser = await _context.PanelKullanicilari
                    .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

                int? currentSubeId = currentUser?.SubeId;
                int? currentAlanId = currentUser?.MasterAlanId;

                var onaylayanSevk = entity.BasvuruSevkleri
                    .FirstOrDefault(s => s.SevkDurumu == SevkDurumu.Onaylandi || s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi );

                if (onaylayanSevk != null)
                {
                    if (currentSubeId.HasValue && onaylayanSevk.SubeId != currentSubeId.Value)
                    {
                        return ServiceResponse<bool>.FailureResult(
                            $"Yetki İhlali: Bu adaya Şube {onaylayanSevk.SubeId} yetkilisi onay vermiştir. Kendi şubenize ait olmayan bir başvuruda işlem yapamazsınız!"
                        );
                    }

                    if (_currentUserService.RolId == 5 && currentAlanId.HasValue)
                    {
                        var sevkAlanId = onaylayanSevk.Departman?.SubeAlan?.MasterAlanId;
                        if (sevkAlanId != null && sevkAlanId != currentAlanId.Value)
                        {
                            return ServiceResponse<bool>.FailureResult(
                                $"Yetki İhlali: Bu adayı başka bir alanın (Örn: Otel/Casino) departmanı onaylamıştır. Kendi alanınıza ait olmayan başvuruyu onaylayamazsınız!"
                            );
                        }
                    }
                }
            }

            try
            {
                if (basvuruyuSonlandir)
                {
                    if (string.IsNullOrWhiteSpace(dto.IslemAciklama))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Başvuruyu tamamen reddetmek için açıklama girilmelidir."
                        );
                    }

                    // Başvurunun mevcut durumu, aşaması ve sevkleri korunur.
                    // Yalnızca süreç tamamen reddedilmiş olarak kilitlenir.
                    entity.TamamenReddedildiMi = true;
                    entity.RevizeDonusAsamasi = null;

                    await _logService.LogBasvuruIslemAsync(
                        entity.Id,
                        _currentUserService.UserId,
                        LogIslemTipi.Red,
                        $"Başvuru İK tarafından tamamen reddedildi ve süreç kilitlendi. Açıklama: {dto.IslemAciklama}",
                        _currentUserService.RolId,
                        entity.BasvuruDurum,
                        entity.BasvuruOnayAsamasi
                    );

                    await _context.SaveChangesAsync();

                    var kisiselBilgiler = entity.Personel?.KisiselBilgiler;
                    var aliciEposta = kisiselBilgiler?.Email;

                    var adSoyad =
                        $"{kisiselBilgiler?.Ad} {kisiselBilgiler?.Soyadi}".Trim();

                    if (string.IsNullOrWhiteSpace(adSoyad))
                    {
                        adSoyad = "Değerli Adayımız";
                    }

                    if (string.IsNullOrWhiteSpace(aliciEposta))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Başvuru tamamen reddedildi ve süreç kilitlendi; ancak adayın e-posta adresi bulunamadığı için red maili gönderilemedi."
                        );
                    }

                    var mailSonucu =
                        await _mailService.OlumsuzGeriDonusMailiGonderAsync(
                            aliciEposta,
                            adSoyad
                        );

                    if (!mailSonucu.Success)
                    {
                        return ServiceResponse<bool>.FailureResult(
                            $"Başvuru tamamen reddedildi ve süreç kilitlendi; ancak red maili gönderilemedi. {mailSonucu.Message}"
                        );
                    }

                    return ServiceResponse<bool>.SuccessResult(
                        true,
                        "Başvuru tamamen reddedildi, süreç kilitlendi ve red maili gönderildi."
                    );
                }
                if (kaldigiYerdenDevamEttir)
                {
                    if (string.IsNullOrWhiteSpace(dto.IslemAciklama))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Revize talebi oluşturmak için açıklama girilmelidir."
                        );
                    }

                    // Tamamen reddedilme kilidi kaldırılır ve başvuru
                    // revize onay sürecine alınır.
                    entity.TamamenReddedildiMi = false;
                    entity.BasvuruDurum = BasvuruDurum.RevizeTalebi;

                    // Gerçek aşama değiştirilmez.
                    // Revize onaylandığında dönülecek hedef, mevcut aşamadır.
                    entity.RevizeDonusAsamasi = entity.BasvuruOnayAsamasi;

                    await _logService.LogBasvuruIslemAsync(
                        entity.Id,
                        _currentUserService.UserId,
                        LogIslemTipi.Revize,
                        $"Tamamen reddedilmiş başvuru için kaldığı aşamaya dönecek şekilde revize talebi oluşturuldu. Açıklama: {dto.IslemAciklama}",
                        _currentUserService.RolId,
                        entity.BasvuruDurum,
                        entity.RevizeDonusAsamasi.Value
                    );

                    await _context.SaveChangesAsync();

                    return ServiceResponse<bool>.SuccessResult(
                        true,
                        "Revize talebi oluşturuldu. Onaylandığında başvuru kaldığı aşamaya dönecektir."
                    );
                }

                if (ilkAsamayaDondur)
                {
                    if (string.IsNullOrWhiteSpace(dto.IslemAciklama))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Revize talebi oluşturmak için açıklama girilmelidir."
                        );
                    }

                    // Tamamen reddedilme kilidi kaldırılır ve başvuru
                    // revize onay sürecine alınır.
                    entity.TamamenReddedildiMi = false;
                    entity.BasvuruDurum = BasvuruDurum.RevizeTalebi;

                    // Gerçek aşamaya dokunulmaz.
                    // Revize kabul edilirse başvuru İK ilk değerlendirmeye dönecektir.
                    entity.RevizeDonusAsamasi =
                        BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme;

                    await _logService.LogBasvuruIslemAsync(
                        entity.Id,
                        _currentUserService.UserId,
                        LogIslemTipi.Revize,
                        $"Tamamen reddedilmiş başvuru için İK ilk değerlendirme aşamasına dönecek şekilde revize talebi oluşturuldu. Açıklama: {dto.IslemAciklama}",
                        _currentUserService.RolId,
                        entity.BasvuruDurum,
                        entity.RevizeDonusAsamasi.Value
                    );

                    await _context.SaveChangesAsync();

                    return ServiceResponse<bool>.SuccessResult(
                        true,
                        "Revize talebi oluşturuldu. Onaylandığında başvuru İK ilk değerlendirme aşamasına dönecektir."
                    );
                }


                var tamamenReddedilmisBasvuruRevizesi =
                    entity.BasvuruDurum == BasvuruDurum.RevizeTalebi &&
                    entity.RevizeDonusAsamasi.HasValue;

                if (tamamenReddedilmisBasvuruRevizesi)
                {
                    if (string.IsNullOrWhiteSpace(dto.IslemAciklama))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Revize kararı için açıklama girilmelidir."
                        );
                    }

                    // Frontend revize onayında DevamEdiyor gönderiyor.
                    if (dto.BasvuruDurum == BasvuruDurum.DevamEdiyor)
                    {
                        var hedefAsama = entity.RevizeDonusAsamasi.Value;

                        entity.TamamenReddedildiMi = false;
                        entity.BasvuruDurum = BasvuruDurum.DevamEdiyor;
                        entity.BasvuruOnayAsamasi = hedefAsama;

                        if (revizeKarariMi &&
    dto.BasvuruDurum == BasvuruDurum.DevamEdiyor &&
    entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme)
                        {
                            var eskiSevkler = await _context.BasvuruSevkleri
                                .Where(x => x.MasterBasvuruId == entity.Id)
                                .ToListAsync();

                            if (eskiSevkler.Any())
                            {
                                _context.BasvuruSevkleri.RemoveRange(eskiSevkler);
                            }
                        }

                        // Hedef uygulandıktan sonra geçici alan temizlenir.
                        entity.RevizeDonusAsamasi = null;

                        await _logService.LogBasvuruIslemAsync(
                            entity.Id,
                            _currentUserService.UserId,
                            LogIslemTipi.Revize,
                            $"Tamamen reddedilmiş başvuru için oluşturulan revize talebi onaylandı. Başvuru seçilen aşamaya döndürüldü. Açıklama: {dto.IslemAciklama}",
                            _currentUserService.RolId,
                            entity.BasvuruDurum,
                            entity.BasvuruOnayAsamasi
                        );

                        await _context.SaveChangesAsync();

                        return ServiceResponse<bool>.SuccessResult(
                            true,
                            "Revize talebi onaylandı ve başvuru seçilen aşamaya döndürüldü."
                        );
                    }

                    // Frontend revize reddinde Reddedildi gönderiyor.
                    if (dto.BasvuruDurum == BasvuruDurum.Reddedildi)
                    {
                        entity.TamamenReddedildiMi = true;
                        entity.BasvuruDurum = BasvuruDurum.Reddedildi;

                        // Gerçek aşama korunur.
                        // Red verilen revizenin hedefi artık geçersizdir.
                        entity.RevizeDonusAsamasi = null;

                        await _logService.LogBasvuruIslemAsync(
                            entity.Id,
                            _currentUserService.UserId,
                            LogIslemTipi.Revize,
                            $"Tamamen reddedilmiş başvuru için oluşturulan revize talebi reddedildi. Başvuru yeniden kilitlendi. Açıklama: {dto.IslemAciklama}",
                            _currentUserService.RolId,
                            entity.BasvuruDurum,
                            entity.BasvuruOnayAsamasi
                        );

                        await _context.SaveChangesAsync();

                        return ServiceResponse<bool>.SuccessResult(
                            true,
                            "Revize talebi reddedildi ve başvuru yeniden tamamen reddedilmiş olarak kilitlendi."
                        );
                    }

                    return ServiceResponse<bool>.FailureResult("Revize talebi için geçersiz bir karar gönderildi.");
                }

                if (isProcessUpdate)
                {
                
                    LogIslemTipi islemTipi = LogIslemTipi.Guncelleme;



                    if (dto.BasvuruDurum == BasvuruDurum.Reddedildi)
                    {
                        islemTipi = LogIslemTipi.Red;

                        var ileriAsamadaRedVerildiMi =
                            entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Son_Kontrol ||
                            entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Genel_Mudur_Onayi ||
                            entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi;

                        // 1) Daha önce departman tarafından onaylanmış sevkleri ele al
                        var onaylayanSevkler = entity.BasvuruSevkleri
                            .Where(s => s.SevkDurumu == SevkDurumu.Onaylandi)
                            .ToList();

                        foreach (var sevk in onaylayanSevkler)
                        {
                            if (ileriAsamadaRedVerildiMi)
                            {
                                // Departman aslında onayladı.
                                // Üst aşama red geldiği için bu onayı geçici iptal ediyoruz.
                                sevk.SevkDurumu = SevkDurumu.OnayUstAsamadaIptalEdildi;

                                // Departman notunu ezmiyoruz.
                            }
                            else
                            {
                                // Üst aşama dışındaki normal redlerde eski mantık.
                                sevk.SevkDurumu = SevkDurumu.Reddedildi;
                                sevk.DegerlendirmeNotu = dto.IslemAciklama;
                            }

                            sevk.IslemTarihi = DateTime.Now;
                        }

                        // 2) Üst aşama red gelince de diğer departmanlar tekrar açılsın.
                        // Bu yüzden burada artık if (!ileriAsamadaRedVerildiMi) olmayacak.
                        var uykudakiSevkler = entity.BasvuruSevkleri
                            .Where(s => s.SevkDurumu == SevkDurumu.BaskaDepartmanOnayladi)
                            .ToList();

                        if (uykudakiSevkler.Any())
                        {
                            foreach (var sevk in uykudakiSevkler)
                            {
                                sevk.SevkDurumu = SevkDurumu.Bekliyor;
                                sevk.DegerlendirmeNotu = string.Empty;
                                sevk.IslemTarihi = DateTime.Now;
                            }

                            dto.BasvuruDurum = BasvuruDurum.DevamEdiyor;
                            dto.BasvuruOnayAsamasi = BasvuruOnayAsamasi.Departman_Onayi;

                            dto.IslemAciklama =
                                $"{dto.IslemAciklama ?? "Başvuru reddedildi."} " +
                                "(Aday bu aşamada reddedildi, ancak diğer şube/departman tercihleri için süreç tekrar aktif edildi.)";
                        }
                    }
                    else if (dto.BasvuruDurum == BasvuruDurum.RevizeTalebi)
                    {
                        islemTipi = LogIslemTipi.Revize;
                    }
                    else if (entity.BasvuruDurum == BasvuruDurum.RevizeTalebi &&
                             dto.BasvuruDurum == BasvuruDurum.DevamEdiyor)
                    {
                        islemTipi = LogIslemTipi.Onay;
                    }
                    else if (entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme &&
                             dto.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Departman_Onayi)
                    {
                        islemTipi = LogIslemTipi.Sevk;
                    }
                    else if (dto.BasvuruDurum == BasvuruDurum.Onaylandi || (int)dto.BasvuruOnayAsamasi > (int)entity.BasvuruOnayAsamasi)
                        islemTipi = LogIslemTipi.Onay;

                    if (dto.BasvuruOnayAsamasi != 0)
                        entity.BasvuruOnayAsamasi = dto.BasvuruOnayAsamasi;

                    if (dto.BasvuruDurum != 0)
                        entity.BasvuruDurum = dto.BasvuruDurum;

                    // Başvuru ileri bir aşamadan tekrar İK ilk değerlendirme / sevk
                    // aşamasına döndüyse eski görev ve teklif artık geçersizdir.
                    var ikIlkDegerlendirmeyeGeriDonduMu =
                        oncekiBasvuruOnayAsamasi !=
                            BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme &&
                        entity.BasvuruOnayAsamasi ==
                            BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme;

                    if (ikIlkDegerlendirmeyeGeriDonduMu)
                    {
                        var eskiGorevAtamalari = await _context.GorevAtamaDetaylari
                            .Where(x => x.PersonelId == entity.PersonelId)
                            .ToListAsync();

                        if (eskiGorevAtamalari.Any())
                        {
                            _context.GorevAtamaDetaylari.RemoveRange(
                                eskiGorevAtamalari
                            );
                        }
                    }

                    var revizeOnaylandiMi = oncekiBasvuruDurumu == BasvuruDurum.RevizeTalebi && entity.BasvuruDurum == BasvuruDurum.DevamEdiyor;

                    if (revizeOnaylandiMi)
                    {
                        // Revize İK ilk değerlendirme aşamasına dönüyorsa
                        // eski sevk turu tamamen temizlenir.
                        if (entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme)
                        {
                            // Eski sevk turunu temizle
                            if (entity.BasvuruSevkleri.Any())
                            {
                                _context.BasvuruSevkleri.RemoveRange(
                                    entity.BasvuruSevkleri
                                );
                            }

                           

                            dto.IslemAciklama =
                                $"{dto.IslemAciklama ?? "Revize talebi onaylandı."} " +
                                "(Başvuru İK ilk değerlendirme aşamasına döndürüldü. Eski departman sevkleri ve görev atama bilgileri temizlendi.)";
                        }

                        // Revize departman aşamasına döndüyse:
                        // mevcut sevkler korunur ve ilgili sevkler tekrar açılır.
                        else if (entity.BasvuruOnayAsamasi ==
                                 BasvuruOnayAsamasi.Departman_Onayi)
                        {
                            /*
                             * Revize departman aşamasına dönüyorsa:
                             * - Revizeyi departman müdürü istediyse sadece o departmanın sevki tekrar açılır.
                             * - Daha önce gerçekten red vermiş başka departmanlar tekrar açılmaz.
                             */

                            var sonRevizeLog = entity.BasvuruIslemLoglari
                                .Where(l => l.IslemTipi == LogIslemTipi.Revize)
                                .OrderByDescending(l => l.Id)
                                .FirstOrDefault();

                            var tekrarAcilacakSevkler = new List<BasvuruSevk>();

                            if (sonRevizeLog != null && sonRevizeLog.RolId == 6)
                            {
                                var revizeIsteyenKullanici = await _context.PanelKullanicilari
                                    .FirstOrDefaultAsync(x => x.Id == sonRevizeLog.PanelKullaniciId);

                                if (revizeIsteyenKullanici == null)
                                {
                                    return ServiceResponse<bool>.FailureResult(
                                        "Revizeyi isteyen departman kullanıcısı bulunamadı."
                                    );
                                }

                                int? revizeIsteyenSubeId = revizeIsteyenKullanici.SubeId;
                                int? revizeIsteyenDepartmanId = revizeIsteyenKullanici.MasterDepartmanId;
                                int? revizeIsteyenAlanId = revizeIsteyenKullanici.MasterAlanId;

                                tekrarAcilacakSevkler = entity.BasvuruSevkleri
                                    .Where(s =>
                                        (
                                            s.SevkDurumu == SevkDurumu.Reddedildi ||
                                            s.SevkDurumu == SevkDurumu.Onaylandi ||
                                            s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                                        ) &&
                                        (!revizeIsteyenSubeId.HasValue || s.SubeId == revizeIsteyenSubeId.Value) &&
                                        (
                                            !revizeIsteyenDepartmanId.HasValue ||
                                            (
                                                s.Departman != null &&
                                                s.Departman.MasterDepartmanId == revizeIsteyenDepartmanId.Value
                                            )
                                        ) &&
                                        (
                                            !revizeIsteyenAlanId.HasValue ||
                                            (
                                                s.Departman != null &&
                                                s.Departman.SubeAlan != null &&
                                                s.Departman.SubeAlan.MasterAlanId == revizeIsteyenAlanId.Value
                                            )
                                        )
                                    )
                                    .ToList();
                            }
                            else
                            {
                                tekrarAcilacakSevkler = entity.BasvuruSevkleri
                                    .Where(s =>
                                        s.SevkDurumu == SevkDurumu.BaskaDepartmanOnayladi ||
                                        s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi
                                    )
                                    .ToList();
                            }

                            foreach (var sevk in tekrarAcilacakSevkler)
                            {
                                sevk.SevkDurumu = SevkDurumu.Bekliyor;
                                sevk.DegerlendirmeNotu = string.Empty;
                                sevk.IslemTarihi = DateTime.Now;
                            }

                            dto.IslemAciklama =
                                $"{dto.IslemAciklama ?? "Revize talebi onaylandı."} " +
                                "(Başvuru tekrar departman değerlendirmesine açıldı.)";
                        }

                        // 2. Revize İK Son Kontrol / GM / Mali aşamasına döndüyse:
                        // Üst aşama reddiyle geçici iptal edilen departman onayını geri açıyoruz.
                        else if (
                         entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Son_Kontrol ||
                         entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Genel_Mudur_Onayi ||
                         entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi
 )
                        {
                            var geciciIptalEdilenSevkler = entity.BasvuruSevkleri
                                .Where(s => s.SevkDurumu == SevkDurumu.OnayUstAsamadaIptalEdildi)
                                .ToList();

                            foreach (var sevk in geciciIptalEdilenSevkler)
                            {
                                sevk.SevkDurumu = SevkDurumu.Onaylandi;
                                sevk.IslemTarihi = DateTime.Now;
                            }

                            // Üst aşamaya geri dönülüyorsa açık bekleyen departman kalmamalı.
                            // Çünkü süreç artık departman değerlendirmesini geçmiş kabul edilir.
                            var bekleyenSevkler = entity.BasvuruSevkleri
                                .Where(s => s.SevkDurumu == SevkDurumu.Bekliyor)
                                .ToList();

                            foreach (var sevk in bekleyenSevkler)
                            {
                                sevk.SevkDurumu = SevkDurumu.BaskaDepartmanOnayladi;
                                sevk.IslemTarihi = DateTime.Now;
                            }

                            if (geciciIptalEdilenSevkler.Any() || bekleyenSevkler.Any())
                            {
                                dto.IslemAciklama =
                                    $"{dto.IslemAciklama ?? "Revize talebi onaylandı."} " +
                                    "(Üst aşama reddiyle geçici iptal edilen departman onayı tekrar aktif edildi.)";
                            }
                        }
                    }

                    if (entity.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Genel_Mudur_Onayi &&
      entity.BasvuruDurum == BasvuruDurum.DevamEdiyor)
                    {
                        var onayliSevkVarMi = entity.BasvuruSevkleri
                            .Any(s => s.SevkDurumu == SevkDurumu.Onaylandi);

                        if (!onayliSevkVarMi)
                        {
                            return ServiceResponse<bool>.FailureResult(
                                "Bu başvuru Genel Müdür onayına gönderilemez. Onaylanmış departman sevki bulunmuyor."
                            );
                        }
                    }

                    await _logService.LogBasvuruIslemAsync(
                        entity.Id,
                        _currentUserService.UserId,
                        islemTipi,
                        dto.IslemAciklama ?? "İşlem açıklaması belirtilmedi.",
                        _currentUserService.RolId,
                        entity.BasvuruDurum,
                        entity.BasvuruOnayAsamasi
                    );
                }
                else
                {
                    entity.BasvuruVersiyonNo = VersiyonYukselt(entity.BasvuruVersiyonNo);
                    _mapper.Map(dto, entity);
                }
                await _context.SaveChangesAsync();

                

                return ServiceResponse<bool>.SuccessResult(true, "İşlem başarıyla kaydedildi ve loglandı.");
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.FailureResult($"Hata oluştu");
            }
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var masterBasvuru = await _context.MasterBasvurular
                .Include(m => m.Personel)
                    .ThenInclude(p => p!.KisiselBilgiler)
                .Include(m => m.Personel)
                    .ThenInclude(p => p!.BasvuruOnay)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (masterBasvuru == null)
                return ServiceResponse<bool>.FailureResult("Silinecek başvuru kaydı bulunamadı.");

            try
            {
                var personel = masterBasvuru.Personel;

                if (personel?.KisiselBilgiler != null && !string.IsNullOrEmpty(personel.KisiselBilgiler.VesikalikFotograf))
                {
                    await _imageService.DeleteImageAsync(personel.KisiselBilgiler.VesikalikFotograf, "personel");
                }

                if (personel != null)
                {
                    _context.Personeller.Remove(personel);
                }
                else
                {
                    _context.MasterBasvurular.Remove(masterBasvuru);
                }

                await _context.SaveChangesAsync();
                return ServiceResponse<bool>.SuccessResult(true, "Başvuru, aday bilgileri, fotoğraflar ve dijital izler kalıcı olarak silindi.");
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.FailureResult($"Silme işlemi sırasında teknik hata");
            }
        }

        private string VersiyonYukselt(string mevcutVersiyon)
        {
            if (string.IsNullOrEmpty(mevcutVersiyon)) return "v1.0";
            try
            {
                string sayiKismi = mevcutVersiyon.Replace("v", "").Split('.')[0];
                int versiyon = int.Parse(sayiKismi);
                versiyon++;
                return $"v{versiyon}.0";
            }
            catch
            {
                return "v2.0";
            }
        }

        public async Task<ServiceResponse<List<BasvuruBildirimDto>>> GetOnayBekleyenBildirimlerAsync(int roleId, int? subeId, int? departmanId, int? alanId)
        {
            var query = _context.MasterBasvurular
                         .Include(x => x.Personel)
                             .ThenInclude(p => p!.KisiselBilgiler!)
                         .Where(x => !x.TamamenReddedildiMi)
                         .AsQueryable();

            // SuperAdmin tüm şubelerdeki aktif / işlem bekleyen
            // başvuruların bildirimlerini görebilir.
            if (roleId == SUPER_ADMIN_ROLE_ID)
            {
                query = query.Where(x =>
                    x.BasvuruOnayAsamasi != BasvuruOnayAsamasi.Tamamlandi
                    &&
                    (
                        x.BasvuruDurum == BasvuruDurum.YeniBasvuru ||
                        x.BasvuruDurum == BasvuruDurum.DevamEdiyor ||
                        x.BasvuruDurum == BasvuruDurum.RevizeTalebi
                    )
                );
            }

            // SÜPER ADMİN BYPASS: Rol 1 ise hiçbir şey yapma, tüm bekleyenleri getirir (İsteğe bağlı, istersen onu da ayırırız ama genel admin tümünü görsün)
            if (roleId != SUPER_ADMIN_ROLE_ID)
            {
 
                // Admin
                if (roleId == 2)
                {
                    query = query.Where(x =>
                        (
                            x.BasvuruOnayAsamasi ==
                                BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme
                            ||
                            x.BasvuruOnayAsamasi ==
                                BasvuruOnayAsamasi.Ik_Son_Kontrol
                        )
                        &&
                        (
                            x.BasvuruDurum == BasvuruDurum.YeniBasvuru ||
                            x.BasvuruDurum == BasvuruDurum.DevamEdiyor ||
                            x.BasvuruDurum == BasvuruDurum.RevizeTalebi
                        )
                    );
                }

                // IkAdmin / IK
                else if (roleId == 3 || roleId == 4)
                {
                    query = query.Where(x =>
                        (
                            (
                                x.BasvuruOnayAsamasi ==
                                    BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme
                                &&
                                (
                                    !subeId.HasValue ||
                                    x.Personel!.IsBasvuruDetay!.BasvuruSubeler
                                        .Any(bs => bs.SubeId == subeId.Value)
                                )
                            )
                            ||
                            (
                                x.BasvuruOnayAsamasi ==
                                    BasvuruOnayAsamasi.Ik_Son_Kontrol
                                &&
                                (
                                    !subeId.HasValue ||
                                    x.BasvuruSevkleri.Any(s =>
                                        s.SevkDurumu == SevkDurumu.Onaylandi &&
                                        s.SubeId == subeId.Value
                                    )
                                )
                            )
                        )
                        &&
                        (
                            x.BasvuruDurum == BasvuruDurum.YeniBasvuru ||
                            x.BasvuruDurum == BasvuruDurum.DevamEdiyor ||
                            x.BasvuruDurum == BasvuruDurum.RevizeTalebi
                        )
                    );
                }

                // Departman Müdürü
                else if (roleId == 6)
                {
                    if (!subeId.HasValue || !departmanId.HasValue)
                    {
                        return ServiceResponse<List<BasvuruBildirimDto>>.FailureResult(
                            "Bildirimleri görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            s.SubeId == subeId.Value &&
                            s.Departman != null &&
                            s.Departman.MasterDepartmanId == departmanId.Value &&
                            s.SevkDurumu == SevkDurumu.Bekliyor
                        )
                        &&
                        x.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Departman_Onayi
                        &&
                        x.BasvuruDurum == BasvuruDurum.DevamEdiyor
                    );
                }

                // Genel Müdür
                else if (roleId == 5)
                {
                    if (!subeId.HasValue || !alanId.HasValue)
                    {
                        return ServiceResponse<List<BasvuruBildirimDto>>.FailureResult(
                            "Bildirimleri görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            s.SevkDurumu == SevkDurumu.Onaylandi &&
                            s.SubeId == subeId.Value &&
                            s.Departman != null &&
                            s.Departman.SubeAlan != null &&
                            s.Departman.SubeAlan.MasterAlanId == alanId.Value
                        )
                        &&
                        x.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Genel_Mudur_Onayi
                        &&
                        (
                            x.BasvuruDurum == BasvuruDurum.DevamEdiyor ||
                            x.BasvuruDurum == BasvuruDurum.YeniBasvuru
                        )
                    );
                }

                // Mali İşler Müdürü
                else if (roleId == 7)
                {
                    if (!subeId.HasValue)
                    {
                        return ServiceResponse<List<BasvuruBildirimDto>>.FailureResult(
                            "Bildirimleri görüntüleme yetkiniz bulunmamaktadır.");
                    }

                    query = query.Where(x =>
                        x.BasvuruSevkleri.Any(s =>
                            s.SevkDurumu == SevkDurumu.Onaylandi &&
                            s.SubeId == subeId.Value
                        )
                        &&
                        x.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Mali_Isler_Mudur_Onayi
                        &&
                        (
                            x.BasvuruDurum == BasvuruDurum.DevamEdiyor ||
                            x.BasvuruDurum == BasvuruDurum.YeniBasvuru
                        )
                    );
                }

                // Tanımsız rol
                else
                {
                    return ServiceResponse<List<BasvuruBildirimDto>>.FailureResult(
                        "Bildirimleri görüntüleme yetkiniz bulunmamaktadır.");
                }
            }

            var bildirimler = await query
                .OrderByDescending(x => x.BasvuruTarihi)
                .Take(15)
                .Select(x => new BasvuruBildirimDto
                {
                    BasvuruId = x.Id,
                    PersonelId = x.PersonelId,
                    PersonelAd = (x.Personel != null && x.Personel.KisiselBilgiler != null) ? x.Personel.KisiselBilgiler.Ad : "İsimsiz",
                    PersonelSoyad = (x.Personel != null && x.Personel.KisiselBilgiler != null) ? x.Personel.KisiselBilgiler.Soyadi : "",
                    BasvuruTarihi = x.BasvuruTarihi
                })
                .ToListAsync();

            return ServiceResponse<List<BasvuruBildirimDto>>.SuccessResult(bildirimler);
        }

        public async Task<ServiceResponse<bool>> SevkEtAsync(SevkEtRequestDto request, int? islemYapanSubeId)
        {
            var roleId = _currentUserService.RolId;
            
            
            if (roleId != 1 && roleId != 2 && roleId != 3 && roleId != 4)
            {
                return ServiceResponse<bool>.FailureResult( "Sevk işlemi için yetkiniz bulunmamaktadır.");
            }

            int? safeSubeId = islemYapanSubeId > 0 ? islemYapanSubeId : null;


            var masterBasvuru = await _context.MasterBasvurular
                .Include(m => m.Personel)
                    .ThenInclude(p => p!.KisiselBilgiler)
                .Include(m => m.Personel)
                    .ThenInclude(p => p!.IsBasvuruDetay)
                        .ThenInclude(d => d!.BasvuruDepartmanlar)
                .Include(m => m.Personel)
                    .ThenInclude(p => p!.IsBasvuruDetay)
                        .ThenInclude(d => d!.BasvuruSubeler)
                .FirstOrDefaultAsync(m => m.Id == request.MasterBasvuruId);

            if (masterBasvuru == null)
                return ServiceResponse<bool>.FailureResult("Başvuru bulunamadı.");

            if (masterBasvuru.TamamenReddedildiMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru tamamen reddedilmiş ve süreç kilitlenmiştir. İK tarafından yeniden açılmadan sevk edilemez."
                );
            }
            if (masterBasvuru.BasvuruDurum == BasvuruDurum.RevizeTalebi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru için revize talebi beklenmektedir. Revize onaylanmadan sevk işlemi yapılamaz."
                );
            }

            if (request.DepartmanIds == null || !request.DepartmanIds.Any())
                return ServiceResponse<bool>.FailureResult("Lütfen sevk edilecek en az bir departman seçiniz.");

          

            bool isSurecBasaDonmus = masterBasvuru.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme ||
                                     masterBasvuru.BasvuruDurum == BasvuruDurum.Reddedildi;

            //  SÜPER ADMİN BYPASS: Rol 1 ise yetki ihlali engeline takılmaz
            if (safeSubeId.HasValue && _currentUserService.RolId != SUPER_ADMIN_ROLE_ID)
            {
                var basvuruSubeler = masterBasvuru.Personel?.IsBasvuruDetay?.BasvuruSubeler;
                bool didApplyToMyBranch = basvuruSubeler != null && basvuruSubeler.Any(bs => bs.SubeId == safeSubeId.Value);

                if (!didApplyToMyBranch)
                {
                    return ServiceResponse<bool>.FailureResult("Yetki Reddedildi: Aday sizin şubenize başvuruda bulunmamıştır. Sadece başvuru yapılan şubelere sevk işlemi gerçekleştirebilirsiniz.");
                }

                if (!isSurecBasaDonmus)
                {
                    var baskaSubeAktifSevkler = await _context.BasvuruSevkleri
                        .Include(s => s.Sube)
                        .Where(s => s.MasterBasvuruId == request.MasterBasvuruId &&
                                    s.SubeId != safeSubeId.Value &&
                                    (s.SevkDurumu == SevkDurumu.Bekliyor ||
                                     s.SevkDurumu == SevkDurumu.Onaylandi ||
                                     s.SevkDurumu == SevkDurumu.BaskaDepartmanOnayladi))
                        .ToListAsync();

                    if (baskaSubeAktifSevkler.Any())
                    {
                        var aktifSubeAdlari = string.Join(", ", baskaSubeAktifSevkler.Select(s => s.Sube!.SubeAdi).Distinct());
                        return ServiceResponse<bool>.FailureResult(
                            $"Sevk Engellendi: Bu başvuru şu anda [{aktifSubeAdlari}] şubesi tarafından değerlendirilmektedir. Adayın oradaki süreci tamamen olumsuz sonuçlanmadan kendi şubenize sevk edemezsiniz."
                        );
                    }
                }
            }

            var adayinSubeDepartmanlari = await _context.Set<Departman>()
                .Include(d => d.MasterDepartman)
                .Include(d => d.SubeAlan)
                    .ThenInclude(sa => sa!.Sube)
                .Include(d => d.SubeAlan)
                    .ThenInclude(sa => sa!.MasterAlan)
                .Where(d => request.DepartmanIds.Contains(d.Id) &&
                           // SÜPER ADMİN BYPASS: Seçilen departman şube ile eşleşmese bile Süper Admin sevk yapabilir.
                           (!safeSubeId.HasValue || _currentUserService.RolId == SUPER_ADMIN_ROLE_ID || (d.SubeAlan != null && d.SubeAlan.SubeId == safeSubeId.Value)))
                .ToListAsync();

            if (!adayinSubeDepartmanlari.Any())
                return ServiceResponse<bool>.FailureResult("Seçilen departmanlar şubenizle eşleşmiyor veya geçersiz.");

            var mevcutSevkQuery = _context.BasvuruSevkleri.Where(bs =>bs.MasterBasvuruId == request.MasterBasvuruId);

            if (masterBasvuru.BasvuruOnayAsamasi !=
                    BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme &&
                safeSubeId.HasValue)
            {
                mevcutSevkQuery = mevcutSevkQuery.Where(
                    bs => bs.SubeId == safeSubeId.Value
                );
            }

            var mevcutSevkler =
                await mevcutSevkQuery.ToListAsync();

            if (!isSurecBasaDonmus && mevcutSevkler.Any(s => s.SevkDurumu == SevkDurumu.Bekliyor || s.SevkDurumu == SevkDurumu.Onaylandi))
                return ServiceResponse<bool>.FailureResult("Bu başvuru ilgili şubelere zaten sevk edilmiş ve süreci aktif olarak devam ediyor.");

            if (mevcutSevkler.Any())
            {
                _context.BasvuruSevkleri.RemoveRange(mevcutSevkler);
                await _context.SaveChangesAsync();
            }

            var yeniSevkler = new List<BasvuruSevk>();
            foreach (var dep in adayinSubeDepartmanlari)
            {
                yeniSevkler.Add(new BasvuruSevk
                {
                    MasterBasvuruId = request.MasterBasvuruId,
                    SubeId = dep.SubeAlan!.SubeId,
                    DepartmanId = dep.Id,
                    SevkDurumu = SevkDurumu.Bekliyor,
                    IslemTarihi = DateTime.Now
                });
            }

            await _context.BasvuruSevkleri.AddRangeAsync(yeniSevkler);

            if (masterBasvuru.BasvuruOnayAsamasi == BasvuruOnayAsamasi.Ik_Ilk_Degerlendirme ||
                masterBasvuru.BasvuruDurum == BasvuruDurum.Reddedildi)
            {
                masterBasvuru.BasvuruOnayAsamasi = BasvuruOnayAsamasi.Departman_Onayi;
                masterBasvuru.BasvuruDurum = BasvuruDurum.DevamEdiyor;
                _context.MasterBasvurular.Update(masterBasvuru);
            }

            var sevkDetaylari = adayinSubeDepartmanlari.Select(dep =>
            {
                string subeAdi = dep.SubeAlan?.Sube?.SubeAdi ?? "Bilinmeyen Şube";
                string alanAdi = dep.SubeAlan?.MasterAlan?.MasterAlanAdi ?? "Genel";
                string depAdi = dep.MasterDepartman?.MasterDepartmanAdi ?? "Departman";

                return $"[{subeAdi} - {alanAdi} - {depAdi}]";
            }).ToList();

            string logAciklama = $"Aday şu birimlere sevk edildi: {string.Join(", ", sevkDetaylari)}";

            await _logService.LogBasvuruIslemAsync(
                masterBasvuru.Id,
                _currentUserService.UserId,
                LogIslemTipi.Sevk,
                logAciklama,
                _currentUserService.RolId,
                masterBasvuru.BasvuruDurum,
                masterBasvuru.BasvuruOnayAsamasi
            );

            await _context.SaveChangesAsync();


            return ServiceResponse<bool>.SuccessResult(true, "Aday seçilen departmanların değerlendirme ekranına gönderildi.");
        }

        public async Task<ServiceResponse<bool>> DepartmanDegerlendirAsync( BasvuruSevkDegerlendirmeDto dto, int? subeId, int departmanId)
        {
            var roleId = _currentUserService.RolId;

            if (roleId != SUPER_ADMIN_ROLE_ID && roleId != 6)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Departman değerlendirmesi için yetkiniz bulunmamaktadır.");
            }

            if (departmanId <= 0)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Geçerli bir departman bilgisi bulunamadı.");
            }

            int? safeSubeId = subeId > 0 ? subeId : null;

            if (roleId == 6 && !safeSubeId.HasValue)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Departman değerlendirmesi için şube yetkiniz bulunmamaktadır.");
            }

            if (dto.Id <= 0)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Geçerli bir başvuru bilgisi bulunamadı.");
            }

            if (dto.SevkDurumu != SevkDurumu.Onaylandi &&
                dto.SevkDurumu != SevkDurumu.Reddedildi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Geçersiz departman değerlendirme işlemi.");
            }

            var currentUser = await _context.PanelKullanicilari
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

            int? currentAlanId = currentUser?.MasterAlanId;


            var sevkKayitlari = await _context.BasvuruSevkleri
                .Include(s => s.MasterBasvuru)
                 .ThenInclude(m => m!.Personel)
                    .ThenInclude(p => p!.KisiselBilgiler)
                .Include(s => s.Departman)
                    .ThenInclude(d => d!.MasterDepartman)
                .Include(s => s.Departman)
                    .ThenInclude(d => d!.SubeAlan)
                        .ThenInclude(sa => sa!.MasterAlan)
                .Where(s => s.MasterBasvuruId == dto.Id &&  ( roleId == SUPER_ADMIN_ROLE_ID ? 
                        ( s.DepartmanId == departmanId || ( s.Departman != null && 
                        s.Departman.MasterDepartmanId == departmanId ) ) : ( s.Departman != null && s.Departman.MasterDepartmanId == departmanId ) ) &&

                            ( roleId == SUPER_ADMIN_ROLE_ID || ( s.SubeId == safeSubeId!.Value && ( !currentAlanId.HasValue || ( s.Departman != null && s.Departman.SubeAlan != null && s.Departman.SubeAlan.MasterAlanId == currentAlanId.Value ) ) ) )
                            && s.SevkDurumu == SevkDurumu.Bekliyor )
                .ToListAsync();

            if (!sevkKayitlari.Any())
                return ServiceResponse<bool>.FailureResult("Değerlendirilecek bekleyen bir sevk kaydı bulunamadı veya bu adayı değerlendirme yetkiniz yok.");

            var masterBasvuru = sevkKayitlari.First().MasterBasvuru;

            if (masterBasvuru == null)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Başvuru kaydı bulunamadı."
                );
            }

            if (masterBasvuru.TamamenReddedildiMi)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru tamamen reddedilmiş ve süreç kilitlenmiştir. Departman değerlendirmesi yapılamaz."
                );
            }

            if (masterBasvuru.BasvuruOnayAsamasi != BasvuruOnayAsamasi.Departman_Onayi || masterBasvuru.BasvuruDurum != BasvuruDurum.DevamEdiyor)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu başvuru şu anda departman değerlendirme aşamasında değildir."
                );
            }

            LogIslemTipi islemTipi;
            string logAciklama;

            string departmanAdi = sevkKayitlari.First().Departman?.MasterDepartman?.MasterDepartmanAdi ?? "Departman";
            string etkilenenAlanlar = string.Join(", ", sevkKayitlari
                .Select(s => s.Departman?.SubeAlan?.MasterAlan?.MasterAlanAdi ?? "Genel")
                .Distinct());

            if (dto.SevkDurumu == SevkDurumu.Onaylandi)
            {
                islemTipi = LogIslemTipi.Onay;
                logAciklama = $"{departmanAdi} Departmanı ({etkilenenAlanlar}) adayı ONAYLADI. Not: {dto.DegerlendirmeNotu}";

                foreach (var sevk in sevkKayitlari)
                {
                    sevk.SevkDurumu = dto.SevkDurumu;
                    sevk.DegerlendirmeNotu = dto.DegerlendirmeNotu;
                    sevk.IslemTarihi = DateTime.Now;
                }

                var onaylananIdler = sevkKayitlari.Select(x => x.Id).ToList();
                var bekleyenDigerSevkler = await _context.BasvuruSevkleri
                    .Where(s => s.MasterBasvuruId == dto.Id && s.SevkDurumu == SevkDurumu.Bekliyor && !onaylananIdler.Contains(s.Id))
                    .ToListAsync();

                foreach (var digerSevk in bekleyenDigerSevkler)
                {
                    digerSevk.SevkDurumu = SevkDurumu.BaskaDepartmanOnayladi;
                }

                if (masterBasvuru != null)
                {
                    masterBasvuru.BasvuruOnayAsamasi = BasvuruOnayAsamasi.Ik_Son_Kontrol;
                    _context.MasterBasvurular.Update(masterBasvuru);
                }
            }
            else if (dto.SevkDurumu == SevkDurumu.Reddedildi)
            {
                islemTipi = LogIslemTipi.Red;

                logAciklama =
                    $"{departmanAdi} Departmanı ({etkilenenAlanlar}) adayı REDDETTİ. " +
                    $"Not: {dto.DegerlendirmeNotu}";

                // 1) Karar veren departmanın sevkini RED yap.
                foreach (var sevk in sevkKayitlari)
                {
                    sevk.SevkDurumu = SevkDurumu.Reddedildi;
                    sevk.DegerlendirmeNotu = dto.DegerlendirmeNotu;
                    sevk.IslemTarihi = DateTime.Now;
                }

                // Bu departmanın daha önce oluşturduğu görev/maaş atamasını temizle.
                // Departman artık adayı reddettiği için bu teklif geçerli değildir.
                if (masterBasvuru.PersonelId > 0)
                {
                    var eskiGorevAtama = await _context.GorevAtamaDetaylari
                        .FirstOrDefaultAsync(x =>
                            x.PersonelId == masterBasvuru.PersonelId &&
                            x.MasterDepartmanId == departmanId);

                    if (eskiGorevAtama != null)
                    {
                        _context.GorevAtamaDetaylari.Remove(eskiGorevAtama);
                    }
                }

                var reddedilenIdler = sevkKayitlari
                    .Select(x => x.Id)
                    .ToList();

                // 2) Bu departman dışındaki bütün sevkleri getir.
                var digerSevkler = await _context.BasvuruSevkleri
                    .Where(s =>
                        s.MasterBasvuruId == dto.Id &&
                        !reddedilenIdler.Contains(s.Id))
                    .ToListAsync();

                // 3) Önceden başka departman onayladığı için uyutulan
                // departmanları tekrar değerlendirmeye aç.
                var tekrarAcilacakSevkler = digerSevkler
                    .Where(s =>
                        s.SevkDurumu == SevkDurumu.BaskaDepartmanOnayladi)
                    .ToList();

                foreach (var sevk in tekrarAcilacakSevkler)
                {
                    sevk.SevkDurumu = SevkDurumu.Bekliyor;
                    sevk.DegerlendirmeNotu = string.Empty;
                    sevk.IslemTarihi = DateTime.Now;
                }

                // 4) Başka değerlendirebilecek departman kaldı mı?
                var halaDegerlendirilecekDepartmanVarMi =
                    digerSevkler.Any(s =>
                        s.SevkDurumu == SevkDurumu.Bekliyor ||
                        s.SevkDurumu == SevkDurumu.Onaylandi);

                if (halaDegerlendirilecekDepartmanVarMi)
                {
                    masterBasvuru.BasvuruDurum =
                        BasvuruDurum.DevamEdiyor;

                    masterBasvuru.BasvuruOnayAsamasi =
                        BasvuruOnayAsamasi.Departman_Onayi;

                    logAciklama +=
                        " (Diğer sevk edilen departmanlar tekrar değerlendirmeye açıldı.)";
                }
                else
                {
                    masterBasvuru.BasvuruDurum =
                        BasvuruDurum.Reddedildi;

                    logAciklama +=
                        " (Değerlendirecek başka departman kalmadığı için genel başvuru reddedildi.)";
                }

                _context.MasterBasvurular.Update(masterBasvuru);
            }
            else
            {
                return ServiceResponse<bool>.FailureResult("Geçersiz değerlendirme statüsü.");
            }

            if (masterBasvuru != null)
            {
                await _logService.LogBasvuruIslemAsync(
                   masterBasvuru.Id,
                   _currentUserService.UserId,
                   islemTipi,
                   logAciklama,
                   _currentUserService.RolId,
                   masterBasvuru.BasvuruDurum,
                   masterBasvuru.BasvuruOnayAsamasi
               );
            }

            await _context.SaveChangesAsync();


            return ServiceResponse<bool>.SuccessResult(true, "Değerlendirmeniz sisteme işlendi.");
        }

    }
}